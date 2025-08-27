// backend/routes/categories.js
const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    router.get('/', async (req, res) => { 
        let client;
        try {
            client = await pool.connect();
            const result = await client.query('SELECT id, name FROM categories ORDER BY name');
            res.json({ success: true, categories: result.rows });
        } catch (error) {
            console.error('카테고리 목록 조회 오류:', error);
            res.status(500).json({ success: false, message: '카테고리 목록을 불러오는 중 서버 오류가 발생했습니다.' });
        } finally {
            if (client) client.release();
        }
    });
    return router;
};