ALTER TABLE products DROP CONSTRAINT products_name_key;

CREATE UNIQUE INDEX uq_products_name_active
ON products(name)
WHERE deleted = false;


ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

CREATE UNIQUE INDEX uq_categories_name_active
ON categories(name)
WHERE deleted = false;


CREATE UNIQUE INDEX uq_reviews_user_product_active
ON reviews(user_name, product_id)
WHERE deleted = false;