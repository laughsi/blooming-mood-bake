const express = require('express');
const router = express.Router();

module.exports = (pool, authMiddleware, adminMiddleware) => {

    // 1. 새로운 주문 생성 (일반 사용자용)
    router.post('/', authMiddleware, async (req, res) => {
        const { items } = req.body;
        const userId = req.user.id; 
        
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: '주문할 상품이 없습니다.' });
        }
        
        for (const item of items) {
            if (typeof item.price !== 'number' || isNaN(item.price) || typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
                console.error('유효하지 않은 상품 데이터:', item);
                return res.status(400).json({
                    success: false,
                    message: '상품 가격 또는 수량이 유효하지 않습니다.'
                });
            }
        }
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); 

            const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const orderInsertQuery = 'INSERT INTO orders(user_id, total_amount, status) VALUES($1, $2, $3) RETURNING id';
            const orderResult = await client.query(orderInsertQuery, [userId, totalAmount, 'pending']);
            const orderId = orderResult.rows[0].id;

            const itemInsertQuery = 'INSERT INTO order_items(order_id, product_id, quantity, price_at_order) VALUES($1, $2, $3, $4)';
            const stockUpdateQuery = 'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1';

            for (const item of items) {
                const stockUpdateResult = await client.query(stockUpdateQuery, [item.quantity, item.product_id]);
                if (stockUpdateResult.rowCount === 0) {
                    throw new Error(`상품 ID ${item.product_id}의 재고가 부족합니다.`);
                }
                await client.query(itemInsertQuery, [orderId, item.product_id, item.quantity, item.price]);
            }

            await client.query('COMMIT');

            res.status(201).json({ 
                success: true, 
                message: '주문이 성공적으로 완료되었습니다.', 
                order: { order_id: orderId, total_amount: totalAmount } 
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('주문 처리 중 오류:', error);
            res.status(500).json({ success: false, message: '주문 처리 중 서버 오류가 발생했습니다.', error: error.message });
        } finally {
            client.release();
        }
    });

    // 2. 모든 주문 정보 가져오기 (관리자용)
    router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
            res.json({ success: true, orders: result.rows });
        } catch (error) {
            console.error('주문 목록 조회 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
    });

    // 3. 특정 주문 상세 정보 가져오기 (관리자용)
    router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });
            }
            res.json({ success: true, order: result.rows[0] });
        } catch (error) {
            console.error('주문 조회 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
    });

    // 4. 주문 상태 업데이트 (관리자용)
    router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;
        const { status } = req.body; 

        if (!status) {
            return res.status(400).json({ success: false, message: '주문 상태를 입력해주세요.' });
        }

        try {
            const result = await pool.query(
                'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: '주문을 찾을 수 없거나 업데이트할 수 없습니다.' });
            }

            res.json({ success: true, message: '주문 상태가 성공적으로 업데이트되었습니다.', order: result.rows[0] });
        } catch (error) {
            console.error('주문 상태 업데이트 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
    });

    // 5. 주문 삭제 (관리자용)
    router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: '주문을 찾을 수 없거나 이미 삭제되었습니다.' });
            }

            res.status(200).json({ success: true, message: '주문이 성공적으로 삭제되었습니다.' });
        } catch (error) {
            console.error('주문 삭제 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }
    });

    return router;
};