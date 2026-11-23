import {
  isRevision,
  parseCategoryInput,
  parseProductInput,
} from '../src/lib/admin-catalog';
import { isRecord } from '../src/lib/catalog';
import { readCatalog } from './catalog';
import { json, methodNotAllowed, problem } from './http';

type Table = 'categories' | 'products';

function categoryWrite(
  db: D1Database,
  body: unknown,
  id: string,
  revision: number | undefined,
) {
  const category = parseCategoryInput(body);
  const fields = [category.name, category.description ?? null];
  return revision === undefined
    ? db
        .prepare(
          'INSERT INTO categories (name, description, id) VALUES (?, ?, ?)',
        )
        .bind(...fields, id)
    : db
        .prepare(
          'UPDATE categories SET name = ?, description = ?, revision = revision + 1 WHERE id = ? AND revision = ?',
        )
        .bind(...fields, id, revision);
}

function productWrite(
  db: D1Database,
  body: unknown,
  id: string,
  revision: number | undefined,
) {
  const product = parseProductInput(body);
  const fields = [
    product.slug,
    product.name,
    product.description,
    product.categoryId,
    product.pricing.type,
    product.pricing.type === 'quote' ? null : product.pricing.amountInCents,
    product.dimensions?.width ?? null,
    product.dimensions?.height ?? null,
    product.dimensions?.depth ?? null,
    Number(product.customizable),
    Number(product.available),
    Number(product.visible),
  ];
  return revision === undefined
    ? db
        .prepare(
          `INSERT INTO products (
        slug, name, description, category_id, pricing_type, amount_in_cents,
        width_cm, height_cm, depth_cm, customizable, available, visible, id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(...fields, id)
    : db
        .prepare(
          `UPDATE products SET
        slug = ?, name = ?, description = ?, category_id = ?, pricing_type = ?, amount_in_cents = ?,
        width_cm = ?, height_cm = ?, depth_cm = ?, customizable = ?, available = ?, visible = ?,
        revision = revision + 1
      WHERE id = ? AND revision = ?`,
        )
        .bind(...fields, id, revision);
}

function prepareWrite(
  db: D1Database,
  table: Table,
  method: string,
  body: Record<string, unknown>,
  id: string,
) {
  if (method === 'POST') {
    return table === 'products'
      ? productWrite(db, body, id, undefined)
      : categoryWrite(db, body, id, undefined);
  }
  if (!isRevision(body.revision))
    throw new Error('Atualize o catálogo antes de editar este cadastro.');
  if (method === 'DELETE') {
    return db
      .prepare(`DELETE FROM ${table} WHERE id = ? AND revision = ?`)
      .bind(id, body.revision);
  }
  if (method === 'PATCH') {
    if (typeof body.visible !== 'boolean')
      throw new Error('Escolha se a peça deve aparecer no catálogo.');
    return db
      .prepare(
        'UPDATE products SET visible = ?, revision = revision + 1 WHERE id = ? AND revision = ?',
      )
      .bind(Number(body.visible), id, body.revision);
  }
  return table === 'products'
    ? productWrite(db, body, id, body.revision)
    : categoryWrite(db, body, id, body.revision);
}

function writeError(error: unknown, method: string, table: Table): Response {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('UNIQUE constraint failed: products.slug')) {
    return problem('Já existe um produto com esse slug.', 409);
  }
  if (message.includes('FOREIGN KEY constraint failed')) {
    return method === 'DELETE' && table === 'categories'
      ? problem(
          'Mova os produtos vinculados antes de excluir esta categoria.',
          409,
        )
      : problem('A categoria selecionada não está mais disponível.', 409);
  }
  console.error('Falha ao gravar o catálogo.', error);
  return problem(
    'Não foi possível salvar a alteração. Confira o catálogo antes de tentar novamente.',
    503,
  );
}

export async function handleAdmin(
  request: Request,
  url: URL,
  db: D1Database,
): Promise<Response> {
  const { pathname } = url;
  const { method } = request;
  if (pathname === '/api/admin/catalog') {
    if (method !== 'GET') return methodNotAllowed('GET');
    return json(await readCatalog(db, true));
  }

  const match = /^\/api\/admin\/(categories|products)(?:\/([^/]+))?$/.exec(
    pathname,
  );
  const table = match?.[1];
  const itemId = match?.[2];
  if (table !== 'categories' && table !== 'products')
    return problem('Recurso não encontrado.', 404);

  const allowed = !itemId
    ? ['POST']
    : table === 'products'
      ? ['PUT', 'PATCH', 'DELETE']
      : ['PUT', 'DELETE'];
  if (!allowed.includes(method)) return methodNotAllowed(allowed.join(', '));

  const origin = request.headers.get('Origin');
  if (
    (origin && origin !== url.origin) ||
    request.headers.get('Sec-Fetch-Site') === 'cross-site'
  ) {
    return problem('Origem não permitida.', 403);
  }
  if (
    request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() !==
    'application/json'
  ) {
    return problem('Envie os dados no formato JSON.', 415);
  }
  let body: unknown;
  let id: string;
  try {
    body = await request.json();
    id = itemId ? decodeURIComponent(itemId) : crypto.randomUUID();
  } catch {
    return problem('Dados da solicitação inválidos.', 400);
  }
  if (!isRecord(body)) return problem('Dados da solicitação inválidos.', 400);

  let statement: D1PreparedStatement;
  try {
    statement = prepareWrite(db, table, method, body, id);
  } catch (error) {
    return problem(
      error instanceof Error ? error.message : 'Revise os dados do cadastro.',
      400,
    );
  }
  try {
    const result = await statement.run();
    if (!result.success) throw new Error('Falha na gravação do D1.');
    if (result.meta.changes === 0) {
      return problem(
        'O cadastro mudou ou foi removido. Atualize a lista antes de editar novamente.',
        409,
      );
    }
    return json({ id }, method === 'POST' ? 201 : 200);
  } catch (error) {
    return writeError(error, method, table);
  }
}
