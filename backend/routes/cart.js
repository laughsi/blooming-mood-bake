// backend/routes/cart.js
const express = require('express');
const router = express.Router();

module.exports = (pool, authMiddleware) => {
    const cartItemQuery = `
        SELECT
            ci.id AS cart_item_id,
            p.id AS product_id,
            p.name,
            p.price,
            p.image_url AS "imageUrl",
            p.stock_quantity AS stock,
            ci.quantity
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1::uuid
    `;

    // 1. 장바구니 목록 조회 (GET /api/cart)
    router.get('/', authMiddleware, async (req, res) => {
        const userId = req.user.id;
        try {
            const result = await pool.query(cartItemQuery, [userId]);
            res.status(200).json({ success: true, cartItems: result.rows });
        } catch (error) {
            console.error('장바구니 조회 오류:', error);
            res.status(500).json({ success: false, message: '장바구니를 불러오는 중 서버 오류가 발생했습니다.' });
        }
    });

    // 2. 장바구니에 상품 추가 또는 수량 업데이트 (POST /api/cart)
    router.post('/', authMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId는 필수 값입니다.' });
        }
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. 상품의 재고 확인
            const productCheck = await client.query('SELECT stock_quantity FROM products WHERE id = $1', [productId]);
            if (productCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
            }
            const productStock = productCheck.rows[0].stock_quantity;

            // 2. 현재 장바구니에 담긴 수량 확인
            const existingCartItem = await client.query('SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
            const currentQuantity = existingCartItem.rows[0] ? existingCartItem.rows[0].quantity : 0;
            const newTotalQuantity = currentQuantity + quantity;

            if (newTotalQuantity > productStock) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: `요청하신 상품의 재고가 부족합니다. 현재 재고: ${productStock}` });
            }

            // 3. 재고가 충분하면, 상품 추가 또는 수량 업데이트
            const query = `
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET
                    quantity = cart_items.quantity + EXCLUDED.quantity,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
            `;
            const result = await client.query(query, [userId, productId, quantity]);
            
            // 4. 업데이트된 상품 정보를 클라이언트에게 반환하기 위해 다시 조회
            const updatedItemQuery = `
                SELECT
                    ci.id AS cart_item_id,
                    p.id AS product_id,
                    p.name,
                    p.price,
                    p.image_url AS "imageUrl",
                    p.stock_quantity AS stock,
                    ci.quantity
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.id = $1::uuid;
            `;
            const updatedItemResult = await client.query(updatedItemQuery, [result.rows[0].id]);
            
            await client.query('COMMIT');

            res.status(200).json({ success: true, message: '장바구니에 상품이 추가(업데이트)되었습니다.', cartItem: updatedItemResult.rows[0] });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('장바구니 상품 추가/업데이트 오류:', error);
            res.status(500).json({ success: false, message: '장바구니 상품 추가 중 서버 오류가 발생했습니다.' });
        } finally {
            client.release();
        }
    });

    // 3. 장바구니 상품 수량 수정 (PUT /api/cart/:productId)
    router.put('/:productId', authMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({ success: false, message: '유효한 수량을 입력하세요.' });
        }
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. 상품의 재고 확인
            const productCheck = await client.query('SELECT stock_quantity FROM products WHERE id = $1', [productId]);
            if (productCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
            }
            const productStock = productCheck.rows[0].stock_quantity;

            if (quantity > productStock) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: `요청하신 상품의 재고가 부족합니다. 현재 재고: ${productStock}` });
            }

            // 2. 재고가 충분하면, 수량 업데이트
            const query = `
                UPDATE cart_items
                SET quantity = $1, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2::uuid AND product_id = $3::uuid
                RETURNING *;
            `;
            const result = await client.query(query, [quantity, userId, productId]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '장바구니 상품을 찾을 수 없습니다.' });
            }

            // 3. 업데이트된 상품 정보를 클라이언트에게 반환
            const updatedItemQuery = `
                SELECT
                    ci.id AS cart_item_id,
                    p.id AS product_id,
                    p.name,
                    p.price,
                    p.image_url AS "imageUrl",
                    p.stock_quantity AS stock,
                    ci.quantity
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.id = $1::uuid;
            `;
            const updatedItemResult = await client.query(updatedItemQuery, [result.rows[0].id]);
            
            await client.query('COMMIT');

            res.status(200).json({ success: true, message: '상품 수량이 업데이트되었습니다.', cartItem: updatedItemResult.rows[0] });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('장바구니 수량 업데이트 오류:', error);
            res.status(500).json({ success: false, message: '장바구니 수량 업데이트 중 서버 오류가 발생했습니다.' });
        } finally {
            client.release();
        }
    });

    // 4. 장바구니 상품 삭제 (DELETE /api/cart/:productId)
    router.delete('/:productId', authMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.params;

        try {
            const result = await pool.query(
                'DELETE FROM cart_items WHERE user_id = $1::uuid AND product_id = $2::uuid RETURNING *',
                [userId, productId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: '장바구니 상품을 찾을 수 없습니다.' });
            }

            res.status(200).json({ success: true, message: '장바구니에서 상품이 삭제되었습니다.' });
        } catch (error) {
            console.error('장바구니 상품 삭제 오류:', error);
            res.status(500).json({ success: false, message: '장바구니 상품 삭제 중 서버 오류가 발생했습니다.' });
        }
    });
    
    // 5. 장바구니 전체 비우기 (DELETE /api/cart)
    router.delete('/', authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const result = await pool.query('DELETE FROM cart_items WHERE user_id = $1::uuid', [userId]);

            if (result.rowCount === 0) {
                 return res.status(200).json({ success: true, message: '장바구니가 이미 비어있습니다.' });
            }
            
            res.status(200).json({ success: true, message: '장바구니가 성공적으로 비워졌습니다.' });
        } catch (error) {
            console.error('장바구니 비우기 오류:', error);
            res.status(500).json({ success: false, message: '장바구니 비우기 중 서버 오류가 발생했습니다.' });
        }
    });

    return router;
};