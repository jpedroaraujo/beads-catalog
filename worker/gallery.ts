import { isImagePosition, isRevision } from '../src/lib/admin-catalog';
import { isRecord } from '../src/lib/catalog';
import { maxProductImages, normalizeImageAlt } from '../src/lib/image-upload';
import {
  allowsMutation,
  contentType,
  json,
  methodNotAllowed,
  problem,
} from './http';
import { cleanImages, readImageUpload, stageImage } from './image-storage';
import type { ImageStorage } from './image-storage';

const currentRevision =
  'EXISTS (SELECT 1 FROM products WHERE id = ? AND revision = ?)';
const readyUpload =
  'EXISTS (SELECT 1 FROM image_cleanup WHERE object_key = ? AND eligible_at > unixepoch())';
const invalidAlt = 'Informe um texto alternativo de até 200 caracteres.';
const conflict =
  'A galeria mudou ou a peça foi removida. Atualize a lista e tente novamente.';

async function changeGallery(
  env: ImageStorage,
  productId: string,
  revision: number,
  mutation: D1PreparedStatement,
): Promise<boolean> {
  // D1 executes this batch in one transaction. changes() refers to the gallery statement.
  const updateRevision = env.DB.prepare(
    `
    UPDATE products SET revision = revision + 1
    WHERE id = ? AND revision = ? AND changes() > 0
  `,
  ).bind(productId, revision);
  const [gallery, product] = await env.DB.batch([mutation, updateRevision]);
  if (!gallery?.success || !product?.success)
    throw new Error('Falha ao gravar a galeria.');
  return product.meta.changes === 1;
}

function uploadStatement(
  env: ImageStorage,
  productId: string,
  revision: number,
  position: number | null,
  key: string,
  alt: string,
) {
  const src = `/api/catalog/images/${key}`;
  return position === null
    ? env.DB.prepare(
        `
        INSERT INTO product_images (product_id, position, sort_order, src, alt, object_key)
        SELECT ?, COALESCE(MAX(position), -1) + 1, COALESCE(MAX(sort_order), -1) + 1, ?, ?, ?
        FROM product_images WHERE product_id = ?
        HAVING COUNT(*) < ? AND ${currentRevision} AND ${readyUpload}
      `,
      ).bind(
        productId,
        src,
        alt,
        key,
        productId,
        maxProductImages,
        productId,
        revision,
        key,
      )
    : env.DB.prepare(
        `
        UPDATE product_images SET src = ?, alt = ?, object_key = ?
        WHERE product_id = ? AND position = ? AND ${currentRevision} AND ${readyUpload}
      `,
      ).bind(src, alt, key, productId, position, productId, revision, key);
}

async function uploadPhoto(
  request: Request,
  env: ImageStorage,
  productId: string,
  position: number | null,
): Promise<Response> {
  const revision = Number(request.headers.get('X-Catalog-Revision'));
  if (!isRevision(revision))
    return problem('Atualize a lista antes de editar esta galeria.', 400);

  let alt: string | null;
  try {
    alt = normalizeImageAlt(
      decodeURIComponent(request.headers.get('X-Image-Alt') ?? ''),
    );
  } catch {
    return problem(invalidAlt, 400);
  }
  if (!alt) return problem(invalidAlt, 400);

  const product = await env.DB.prepare(
    `
    SELECT p.revision, COUNT(i.position) AS total
    FROM products AS p LEFT JOIN product_images AS i ON i.product_id = p.id
    WHERE p.id = ? GROUP BY p.id
  `,
  )
    .bind(productId)
    .first<{ revision: number; total: number }>();
  if (product?.revision !== revision) return problem(conflict, 409);
  if (position === null && product.total >= maxProductImages) {
    return problem(`Cada produto pode ter até ${maxProductImages} fotos.`, 409);
  }

  const upload = await readImageUpload(request);
  if (upload instanceof Response) return upload;
  const key = await stageImage(env, upload.bytes, upload.mime);
  const saved = await changeGallery(
    env,
    productId,
    revision,
    uploadStatement(env, productId, revision, position, key, alt),
  );
  if (!saved) {
    await env.DB.prepare(
      'UPDATE image_cleanup SET eligible_at = unixepoch() WHERE object_key = ?',
    )
      .bind(key)
      .run();
    await cleanImages(env);
    return problem(conflict, 409);
  }
  await cleanImages(env);
  return json({ id: productId }, position === null ? 201 : 200);
}

function prepareOrder(
  db: D1Database,
  productId: string,
  revision: number,
  value: unknown,
): D1PreparedStatement | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > maxProductImages ||
    !value.every(isImagePosition) ||
    new Set(value).size !== value.length
  )
    return null;
  const positions = JSON.stringify(value);
  return db
    .prepare(
      `
    WITH requested AS (SELECT key, value FROM json_each(?))
    UPDATE product_images
    SET sort_order = (SELECT key FROM requested WHERE requested.value = product_images.position)
    WHERE product_id = ? AND ${currentRevision}
      AND json_array_length(?) = (SELECT COUNT(*) FROM product_images WHERE product_id = ?)
      AND NOT EXISTS (
        SELECT 1 FROM requested
        WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = ? AND position = requested.value)
      )
  `,
    )
    .bind(
      positions,
      productId,
      productId,
      revision,
      positions,
      productId,
      productId,
    );
}

async function changePhoto(
  request: Request,
  env: ImageStorage,
  productId: string,
  slot: number | 'order',
): Promise<Response> {
  if (contentType(request) !== 'application/json')
    return problem('Envie os dados no formato JSON.', 415);
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || !isRevision(body.revision)) {
    return problem('Atualize a lista antes de editar esta galeria.', 400);
  }

  let mutation: D1PreparedStatement;
  if (slot === 'order') {
    const order = prepareOrder(
      env.DB,
      productId,
      body.revision,
      body.positions,
    );
    if (!order) return problem('Revise a ordem das fotos.', 400);
    mutation = order;
  } else if (request.method === 'PATCH') {
    const alt = normalizeImageAlt(body.alt);
    if (!alt) return problem(invalidAlt, 400);
    mutation = env.DB.prepare(
      `
      UPDATE product_images SET alt = ?
      WHERE product_id = ? AND position = ? AND ${currentRevision}
    `,
    ).bind(alt, productId, slot, productId, body.revision);
  } else {
    mutation = env.DB.prepare(
      `
      DELETE FROM product_images WHERE product_id = ? AND position = ? AND ${currentRevision}
    `,
    ).bind(productId, slot, productId, body.revision);
  }
  if (!(await changeGallery(env, productId, body.revision, mutation)))
    return problem(conflict, 409);
  await cleanImages(env);
  return json({ id: productId });
}

export async function handleGallery(
  request: Request,
  url: URL,
  env: ImageStorage,
): Promise<Response | null> {
  const match = /^\/api\/admin\/products\/([^/]+)\/images(?:\/([^/]+))?$/.exec(
    url.pathname,
  );
  const itemId = match?.[1];
  if (!itemId) return null;

  const rawSlot = match?.[2];
  const { method } = request;
  const allow =
    rawSlot === undefined
      ? ['POST']
      : rawSlot === 'order'
        ? ['PUT']
        : ['PUT', 'PATCH', 'DELETE'];
  if (!allow.includes(method)) return methodNotAllowed(allow.join(', '));
  if (!allowsMutation(request, url))
    return problem('Origem não permitida.', 403);

  let productId: string;
  try {
    productId = decodeURIComponent(itemId);
  } catch {
    return problem('Produto inválido.', 400);
  }

  const position = rawSlot === undefined ? null : Number(rawSlot);
  if (
    rawSlot !== 'order' &&
    rawSlot !== undefined &&
    (!/^\d+$/.test(rawSlot) || !isImagePosition(position))
  ) {
    return problem('Foto não encontrada.', 404);
  }
  try {
    if (method === 'POST' || (method === 'PUT' && rawSlot !== 'order')) {
      return await uploadPhoto(request, env, productId, position);
    }
    return await changePhoto(
      request,
      env,
      productId,
      rawSlot === 'order' ? 'order' : Number(position),
    );
  } catch (error) {
    console.error('Falha ao alterar a galeria.', error);
    return problem(
      'Não foi possível concluir a alteração da galeria. Atualize a lista antes de tentar novamente.',
      503,
    );
  }
}
