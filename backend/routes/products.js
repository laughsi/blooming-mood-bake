// backend/routes/products.js
const express = require('express');
const router = express.Router();

const formatProductResponse = (productRow) => {
    let formattedImageUrl = null;
    if (productRow.image_url) {
        formattedImageUrl = productRow.image_url;
    }

    return {
        ...productRow,
        imageUrl: formattedImageUrl,
    };
};

module.exports = (pool) => {
    // 상품 목록 조회 (GET /api/products)
    router.get('/', async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            const { category, search, page = 1, limit = 10 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const conditions = [];
            const params = [];
            let paramIndex = 1;

            conditions.push('p.is_available = true');

            if (category) {
                conditions.push(`c.name ILIKE $${paramIndex++}`);
                params.push(`%${category}%`);
            }
            if (search) {
                conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
                params.push(`%${search}%`);
                paramIndex++;
            }
            
            const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
            const queryParams = [...params];
            const countQueryParams = [...params];

            const countQuery = `
                SELECT COUNT(*) 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                ${whereClause}
            `;
            
            const query = `
                SELECT
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock_quantity as stock,
                    p.is_available,
                    p.is_monthly_menu,
                    p.is_signature_menu,
                    c.name AS category_name,
                    p.image_url
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                ${whereClause}
                ORDER BY p.created_at DESC
                LIMIT $${paramIndex++} OFFSET $${paramIndex++};
            `;
            queryParams.push(parseInt(limit), offset);

            const [totalCountResult, productsResult] = await Promise.all([
                client.query(countQuery, countQueryParams),
                client.query(query, queryParams)
            ]);
            
            const totalProducts = parseInt(totalCountResult.rows[0].count);
            const formattedProducts = productsResult.rows.map(formatProductResponse);

            res.status(200).json({
                success: true,
                products: formattedProducts,
                pagination: {
                    totalProducts,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalProducts / parseInt(limit)),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('상품 목록 조회 오류:', error);
            res.status(500).json({ success: false, message: '상품 목록을 불러오는 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // 특정 상품 상세 조회 (GET /api/products/:id)
    router.get('/:id', async (req, res) => {
        let client;
        const { id } = req.params;
        try {
            client = await pool.connect();
            
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ success: false, message: '유효하지 않은 상품 ID 형식입니다.' });
            }
            
            const productResult = await client.query(
                `SELECT
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock_quantity as stock,
                    p.is_available,
                    p.is_monthly_menu,
                    p.is_signature_menu,
                    p.category_id,
                    c.name AS category_name,
                    p.image_url
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = $1::uuid`,
                [id]
            );

            const product = productResult.rows[0];

            if (!product) {
                return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
            }

            const formattedProduct = formatProductResponse(product);

            res.status(200).json({ success: true, product: formattedProduct });
        } catch (error) {
            console.error('특정 상품 조회 오류:', error);
            res.status(500).json({ success: false, message: '상품 정보를 불러오는 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    return router;
};