// backend/routes/orders.js
const express = require('express');
const router = express.Router();

module.exports = (pool, authMiddleware, adminMiddleware) => {

    // 1. 모든 주문 정보 가져오기 (관리자용)
    router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
            res.json(result.rows);
        } catch (error) {
            console.error('주문 목록 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    });

    // 2. 특정 주문 상세 정보 가져오기 (관리자용)
    router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error('주문 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    });

    // 3. 주문 상태 업데이트 (관리자용)
    router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;
        const { status } = req.body; 

        if (!status) {
            return res.status(400).json({ message: '주문 상태를 입력해주세요.' });
        }

        try {
            const result = await pool.query(
                'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: '주문을 찾을 수 없거나 업데이트할 수 없습니다.' });
            }

            res.json({ success: true, message: '주문 상태가 성공적으로 업데이트되었습니다.', order: result.rows[0] });
        } catch (error) {
            console.error('주문 상태 업데이트 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    });

    // 4. 주문 삭제 (관리자용)
    router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: '주문을 찾을 수 없거나 이미 삭제되었습니다.' });
            }

            res.status(200).json({ success: true, message: '주문이 성공적으로 삭제되었습니다.' });
        } catch (error) {
            console.error('주문 삭제 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    });

    return router;
};