import { maxImageBytes, maxImageSizeMB } from '../src/lib/image-upload';
import { contentType, methodNotAllowed, problem } from './http';

const objectKeyPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const tooLarge = `A foto deve ter até ${maxImageSizeMB} MB.`;
const invalidSize = 'O tamanho recebido não corresponde ao arquivo enviado.';

export interface ImageStorage {
  readonly DB: D1Database;
  readonly PHOTOS: R2Bucket;
}

export async function serveImage(
  request: Request,
  env: ImageStorage,
  objectKey: string,
  admin: boolean,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD')
    return methodNotAllowed('GET, HEAD');
  if (!objectKeyPattern.test(objectKey))
    return problem('Imagem não encontrada.', 404);
  const reference = await env.DB.prepare(
    `
    SELECT i.object_key FROM product_images AS i
    JOIN products AS p ON p.id = i.product_id
    WHERE i.object_key = ? ${admin ? '' : 'AND p.visible = 1'}
  `,
  )
    .bind(objectKey)
    .first();
  if (!reference) return problem('Imagem não encontrada.', 404);

  const object =
    request.method === 'HEAD'
      ? await env.PHOTOS.head(objectKey)
      : await env.PHOTOS.get(objectKey);
  const mime = object?.httpMetadata?.contentType;
  if (!object || !mime || !imageMimeTypes.includes(mime)) {
    return problem('Imagem não encontrada.', 404);
  }
  const body =
    'body' in object && object.body instanceof ReadableStream
      ? object.body
      : null;
  return new Response(body, {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(object.size),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function detectMime(bytes: Uint8Array): string | null {
  const size = bytes.length;
  if (size < 16) return null;
  const isJpeg =
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff &&
    bytes[size - 2] === 0xff &&
    bytes[size - 1] === 0xd9;
  if (isJpeg) return 'image/jpeg';

  const ascii = new TextDecoder();
  const view = new DataView(bytes.buffer, bytes.byteOffset, size);
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng =
    size >= 33 &&
    pngSignature.every((byte, index) => bytes[index] === byte) &&
    view.getUint32(8) === 13 &&
    ascii.decode(bytes.subarray(12, 16)) === 'IHDR' &&
    view.getUint32(16) > 0 &&
    view.getUint32(20) > 0;
  if (isPng) return 'image/png';

  const isWebp =
    size >= 20 &&
    ascii.decode(bytes.subarray(0, 4)) === 'RIFF' &&
    view.getUint32(4, true) === size - 8 &&
    ascii.decode(bytes.subarray(8, 12)) === 'WEBP' &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(ascii.decode(bytes.subarray(12, 16)));
  return isWebp ? 'image/webp' : null;
}

export async function readImageUpload(
  request: Request,
): Promise<{ bytes: Uint8Array; mime: string } | Response> {
  const lengthHeader = request.headers.get('Content-Length');
  const length = lengthHeader === null ? null : Number(lengthHeader);
  if (length !== null) {
    if (length > maxImageBytes) return problem(tooLarge, 413);
    if (!Number.isSafeInteger(length) || length < 0)
      return problem(invalidSize, 400);
  }
  const declared = contentType(request);
  if (
    !declared ||
    (!imageMimeTypes.includes(declared) &&
      declared !== 'application/octet-stream')
  ) {
    return problem('Envie uma imagem JPEG, PNG ou WebP.', 415);
  }
  if (!request.body) return problem('Selecione uma foto para enviar.', 400);

  const reader = request.body.getReader();
  // Allocate once to avoid retaining all stream chunks alongside a full copy.
  const buffer = new Uint8Array(length ?? maxImageBytes);
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const nextSize = size + value.byteLength;
      if (nextSize > buffer.byteLength) {
        await reader.cancel().catch(() => undefined);
        return nextSize > maxImageBytes
          ? problem(tooLarge, 413)
          : problem(invalidSize, 400);
      }
      buffer.set(value, size);
      size = nextSize;
    }
  } finally {
    reader.releaseLock();
  }

  if (length !== null && size !== length) return problem(invalidSize, 400);
  const bytes = buffer.subarray(0, size);
  const mime = detectMime(bytes);
  if (!mime || (declared !== 'application/octet-stream' && mime !== declared)) {
    return problem(
      'O conteúdo da foto não corresponde a um formato aceito.',
      415,
    );
  }
  return { bytes, mime };
}

export async function stageImage(
  env: ImageStorage,
  bytes: Uint8Array,
  mime: string,
): Promise<string> {
  const key = crypto.randomUUID();
  const tracked = await env.DB.prepare(
    `
    INSERT INTO image_cleanup (object_key, eligible_at) VALUES (?, unixepoch() + 3600)
  `,
  )
    .bind(key)
    .run();
  if (!tracked.success) throw new Error('Falha ao registrar o upload.');
  const object = await env.PHOTOS.put(key, bytes, {
    httpMetadata: { contentType: mime },
  });
  if (!object) throw new Error('Falha ao gravar a foto no R2.');
  return key;
}

export async function cleanImages(env: ImageStorage): Promise<void> {
  try {
    const { results } = await env.DB.prepare(
      `
      SELECT object_key FROM image_cleanup
      WHERE eligible_at <= unixepoch()
      ORDER BY eligible_at LIMIT 10
    `,
    ).all<{ object_key: string }>();
    for (const { object_key } of results) {
      try {
        await env.PHOTOS.delete(object_key);
        await env.DB.prepare('DELETE FROM image_cleanup WHERE object_key = ?')
          .bind(object_key)
          .run();
      } catch (error) {
        console.error('Falha ao limpar foto sem vínculo.', error);
      }
    }
  } catch (error) {
    console.error('Falha ao consultar a fila de limpeza de fotos.', error);
  }
}
