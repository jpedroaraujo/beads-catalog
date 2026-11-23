INSERT INTO categories (id, name) VALUES
  ('chaveiros', 'Chaveiros'),
  ('decoracao', 'Decoração'),
  ('marcadores', 'Marcadores')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
  id, slug, name, description, category_id, pricing_type, amount_in_cents,
  width_cm, height_cm, customizable, available, visible
) VALUES
  ('flor', 'flor-de-bolso', 'Flor de bolso', 'Uma pequena flor colorida para decorar as chaves.', 'chaveiros', 'fixed', 1500, 6, 6, 1, 1, 1),
  ('margarida', 'margarida-solar', 'Margarida solar', 'Uma margarida de pétalas claras e miolo dourado.', 'decoracao', 'starting_at', 2200, 9, 9, 0, 0, 1),
  ('peca-oculta', 'peca-oculta', 'Peça oculta de teste', 'Cadastro local usado para testar a visibilidade.', 'decoracao', 'quote', NULL, NULL, NULL, 0, 1, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, position, src, alt) VALUES
  ('flor', 0, '/images/flower.svg', 'Ilustração de uma flor lilás com miolo amarelo'),
  ('margarida', 0, '/images/daisy.svg', 'Ilustração de uma margarida branca em beads')
ON CONFLICT (product_id, position) DO NOTHING;
