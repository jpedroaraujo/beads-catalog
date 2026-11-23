CREATE TABLE categories (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(id)) > 0),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT
) STRICT;

CREATE TABLE products (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(id)) > 0),
  slug TEXT UNIQUE NOT NULL CHECK (length(trim(slug)) > 0),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  pricing_type TEXT NOT NULL,
  amount_in_cents INTEGER,
  width_cm REAL,
  height_cm REAL,
  depth_cm REAL,
  customizable INTEGER NOT NULL CHECK (customizable IN (0, 1)),
  available INTEGER NOT NULL CHECK (available IN (0, 1)),
  visible INTEGER NOT NULL DEFAULT 0 CHECK (visible IN (0, 1)),
  CHECK (
    (pricing_type = 'quote' AND amount_in_cents IS NULL) OR
    (pricing_type IN ('fixed', 'starting_at') AND amount_in_cents IS NOT NULL
      AND amount_in_cents BETWEEN 0 AND 9007199254740991)
  ),
  CHECK (
    (width_cm IS NULL AND height_cm IS NULL AND depth_cm IS NULL) OR
    (width_cm IS NOT NULL AND width_cm > 0 AND width_cm <= 1.7976931348623157e308
      AND height_cm IS NOT NULL AND height_cm > 0 AND height_cm <= 1.7976931348623157e308
      AND (depth_cm IS NULL OR (depth_cm > 0 AND depth_cm <= 1.7976931348623157e308)))
  )
) STRICT;

CREATE INDEX products_by_category ON products(category_id);

CREATE TABLE product_images (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 0),
  src TEXT NOT NULL CHECK (length(trim(src)) > 0),
  alt TEXT NOT NULL CHECK (length(trim(alt)) > 0),
  PRIMARY KEY (product_id, position),
  UNIQUE (product_id, src)
) STRICT;
