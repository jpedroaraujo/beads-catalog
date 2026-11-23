ALTER TABLE product_images ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0);
UPDATE product_images SET sort_order = position;

ALTER TABLE product_images ADD COLUMN object_key TEXT;
CREATE UNIQUE INDEX product_images_object_key ON product_images(object_key) WHERE object_key IS NOT NULL;

CREATE TABLE image_cleanup (
  object_key TEXT PRIMARY KEY NOT NULL,
  eligible_at INTEGER NOT NULL
) STRICT;

CREATE INDEX image_cleanup_ready ON image_cleanup(eligible_at);

CREATE TRIGGER product_image_attached AFTER INSERT ON product_images
WHEN NEW.object_key IS NOT NULL
BEGIN
  DELETE FROM image_cleanup WHERE object_key = NEW.object_key;
END;

CREATE TRIGGER product_image_replaced AFTER UPDATE OF object_key ON product_images
WHEN OLD.object_key IS NOT NEW.object_key
BEGIN
  INSERT OR IGNORE INTO image_cleanup(object_key, eligible_at)
    SELECT OLD.object_key, unixepoch() WHERE OLD.object_key IS NOT NULL;
  DELETE FROM image_cleanup WHERE object_key = NEW.object_key;
END;

CREATE TRIGGER product_image_removed AFTER DELETE ON product_images
WHEN OLD.object_key IS NOT NULL
BEGIN
  INSERT OR IGNORE INTO image_cleanup(object_key, eligible_at)
    VALUES (OLD.object_key, unixepoch());
END;
