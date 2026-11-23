import { parseAdminCatalog } from '../src/lib/admin-catalog';
import { parseCatalog } from '../src/lib/catalog';

function categoriesQuery(admin: boolean): string {
  return `
  SELECT json_patch(
    json_object('id', id, 'name', name${admin ? ", 'revision', revision" : ''}),
    json_object('description', description)
  ) AS item
  FROM categories ORDER BY name, id
`;
}

function productsQuery(admin: boolean): string {
  return `
  SELECT json_patch(json_object(
    'id', p.id, 'slug', p.slug, 'name', p.name, 'description', p.description,
    'categoryId', p.category_id,
    'images', json((
      SELECT json_group_array(json_object('src', src, 'alt', alt) ORDER BY position)
      FROM product_images WHERE product_id = p.id
    )),
    'pricing', json_patch(
      json_object('type', p.pricing_type),
      json_object('amountInCents', p.amount_in_cents)
    ),
    'customizable', json(CASE p.customizable WHEN 1 THEN 'true' ELSE 'false' END),
    'available', json(CASE p.available WHEN 1 THEN 'true' ELSE 'false' END)
    ${admin ? ", 'revision', p.revision, 'visible', json(CASE p.visible WHEN 1 THEN 'true' ELSE 'false' END)" : ''}
  ), json_object(
    'dimensions', CASE WHEN p.width_cm IS NOT NULL THEN json_patch(
      json_object('width', p.width_cm, 'height', p.height_cm, 'unit', 'cm'),
      json_object('depth', p.depth_cm)
    ) END
  )) AS item
  FROM products AS p ${admin ? '' : 'WHERE p.visible = 1'} ORDER BY p.name, p.id
`;
}

export async function readCatalog(db: D1Database, admin: boolean) {
  const [categories, products] = await db.batch<{ item: string }>([
    db.prepare(categoriesQuery(admin)),
    db.prepare(productsQuery(admin)),
  ]);
  if (!categories?.success || !products?.success) {
    throw new Error('Falha na leitura do D1.');
  }
  const data = {
    categories: categories.results.map(
      ({ item }) => JSON.parse(item) as unknown,
    ),
    products: products.results.map(({ item }) => JSON.parse(item) as unknown),
  };
  return admin ? parseAdminCatalog(data) : parseCatalog(data);
}
