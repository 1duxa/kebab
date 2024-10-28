-- Only Part of DB

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    order_date TIMESTAMP DEFAULT NOW(),
    total_price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Pending'
);
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,
    price DECIMAL(10, 2)
);
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    product_id INT REFERENCES products(product_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    review_date TIMESTAMP DEFAULT NOW()
);
*/
--select * from users
/*CREATE UNIQUE INDEX name_index_unique
ON users (user_name);*/

CREATE OR REPLACE FUNCTION create_order(
    p_user_name VARCHAR,
    p_order_date timestamp with time zone,
    p_total_price DECIMAL(10, 2),
    p_items JSONB  --масив json
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_order_id INT;
    v_item JSONB;
    v_product_id INT;
    v_quantity INT;
    v_price DECIMAL(10, 2);
BEGIN
    SELECT user_id INTO v_user_id
    FROM users
    WHERE user_name = p_user_name;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with name % not found', p_user_name;
    END IF;

    INSERT INTO orders (user_id, order_date, total_price)
    VALUES (v_user_id, p_order_date, p_total_price)
    RETURNING order_id INTO v_order_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::INT;
        v_quantity := (v_item->>'quantity')::INT;
        v_price := (v_item->>'price')::DECIMAL;
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (v_order_id, v_product_id, v_quantity, v_price);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

--select * from order_items
