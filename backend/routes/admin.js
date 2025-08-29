// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

module.exports = (pool, authMiddleware, adminMiddleware, supabase, productBucketName) => {
    const uploadProductMiddleware = multer({ storage: multer.memoryStorage() });

    const formatProductResponse = (productRow) => {
        let formattedImageUrl = null;
        if (productRow.image_url) {
            formattedImageUrl = productRow.image_url;
        }
        
        return {
            id: productRow.id,
            name: productRow.name,
            description: productRow.description,
            category_id: productRow.category_id,
            category_name: productRow.category_name,
            price: productRow.price,
            stock: productRow.stock_quantity,
            imageUrl: formattedImageUrl,
            status: productRow.is_available,
            is_monthly_menu: productRow.is_monthly_menu, 
            is_signature_menu: productRow.is_signature_menu,
            created_at: productRow.created_at,
            updated_at: productRow.updated_at
        };
    };
    
    const formatUserResponse = (userRow) => {
        return {
            id: userRow.id,
            login_id: userRow.login_id,
            email: userRow.email,
            username: userRow.username,
            profile_image_url: userRow.profile_image_url,
            phone_number: userRow.phone_number,
            address: userRow.address,
            is_social_user: userRow.is_social_user,
            is_admin: userRow.is_admin,
            is_active: userRow.is_active,
            created_at: userRow.created_at,
            updated_at: userRow.updated_at
        };
    };

    router.get('/dashboard', authMiddleware, adminMiddleware, (req, res) => {
        res.json({ success: true, message: '관리자 대시보드 데이터입니다. (곧 실제 데이터를 포함할 예정입니다.)' });
    });

    // ==========================================================
    // 상품 목록 조회 라우트 (GET /admin/products)
    // ==========================================================
    router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        try {
            client = await pool.connect();

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const filterCategory = req.query.category || '';
            const offset = (page - 1) * limit;

            const conditions = [];
            const params = [];
            let paramIndex = 1;

            if (search) {
                conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
                params.push(`%${search}%`);
                paramIndex++;
            }
            if (filterCategory) {
                conditions.push(`c.name ILIKE $${paramIndex}`);
                params.push(`%${filterCategory}%`);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

            const query = `
                SELECT
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.stock_quantity,
                    p.category_id,
                    c.name AS category_name,
                    p.image_url,
                    p.is_available,
                    p.is_monthly_menu,
                    p.is_signature_menu,
                    p.created_at,
                    p.updated_at
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                ${whereClause}
                ORDER BY p.created_at DESC
                LIMIT $${paramIndex++} OFFSET $${paramIndex++};
            `;
            const queryParams = [...params, limit, offset];

            const countQuery = `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause};`;

            const [productsResult, countResult] = await Promise.all([
                client.query(query, queryParams),
                client.query(countQuery, params)
            ]);

            const totalProducts = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalProducts / limit);

            const productsWithFormattedImages = productsResult.rows.map(row => formatProductResponse(row));

            res.json({
                success: true,
                products: productsWithFormattedImages,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalProducts: totalProducts,
                    limit: limit
                }
            });

        } catch (error) {
            console.error('상품 목록 조회 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '상품 목록을 불러오는 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 새 상품 추가 라우트 (POST /admin/products)
    // ==========================================================
    router.post('/products', authMiddleware, adminMiddleware, uploadProductMiddleware.single('image'), async (req, res) => {
        let client;
        let imageUrlFromSupabase = null;

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const { name, category, price, stock, description, is_monthly_menu, is_signature_menu, is_available } = req.body;

            if (!name || !price || !stock || !category) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: '필수 필드가 누락되었습니다.' });
            }

            if (req.file) {
                const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
                const { data, error } = await supabase.storage
                    .from(productBucketName)
                    .upload(fileName, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert: false 
                    });

                if (error) {
                    await client.query('ROLLBACK');
                    console.error('Supabase 파일 업로드 오류:', error);
                    return res.status(500).json({ success: false, message: `이미지 업로드 중 오류 발생: ${error.message}` });
                }

                const { data: publicUrlData } = supabase.storage
                    .from(productBucketName)
                    .getPublicUrl(fileName);

                imageUrlFromSupabase = publicUrlData.publicUrl;
            }

            const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
            if (categoryResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: '유효하지 않은 카테고리입니다.' });
            }
            const category_id = categoryResult.rows[0].id;

            const finalIsAvailable = (is_available !== undefined && is_available !== null)
                                            ? (is_available === 'true')
                                            : (parseInt(stock) > 0);

            const isMonthlyMenuBool = is_monthly_menu === 'true';
            const isSignatureMenuBool = is_signature_menu === 'true';

            const insertQuery = `
                INSERT INTO products (
                    name, description, price, stock_quantity, category_id,
                    image_url, is_available, is_monthly_menu, is_signature_menu, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9, NOW(), NOW()
                ) RETURNING *;
            `;
            const values = [
                name,
                description || null,
                parseInt(price),
                parseInt(stock),
                category_id,
                imageUrlFromSupabase,
                finalIsAvailable,
                isMonthlyMenuBool,
                isSignatureMenuBool
            ];

            const { rows } = await client.query(insertQuery, values);
            await client.query('COMMIT');

            const productToReturn = formatProductResponse(rows[0]);
            res.status(201).json({ success: true, message: '새 상품이 성공적으로 등록되었습니다.', product: productToReturn });

        } catch (error) {
            if (client) { await client.query('ROLLBACK'); }
            if (imageUrlFromSupabase) {
                const fileNameToDelete = path.basename(new URL(imageUrlFromSupabase).pathname);
                await supabase.storage.from(productBucketName).remove([fileNameToDelete]);
            }
            console.error('상품 등록 중 오류 발생:', error);
            const errorMessage = (error.code === '23503') ? '데이터베이스 오류: 카테고리 ID가 존재하지 않습니다.' :
                                         (error.code === '23502') ? `데이터베이스 오류: 필수 필드가 누락되었습니다. (${error.detail})` :
                                         '상품 등록 중 서버 오류가 발생했습니다.';
            res.status(500).json({ success: false, message: errorMessage, detailedError: error.message });
        } finally {
            if (client) { client.release(); }
        }
    });

    // ==========================================================
    // 특정 상품 상세 조회 라우트 (GET /admin/products/:id)
    // ==========================================================
    router.get('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
                    p.id, p.name, p.description, p.price, p.stock_quantity,
                    p.is_available, p.is_monthly_menu, p.is_signature_menu,
                    p.category_id, c.name AS category_name, p.image_url,
                    p.created_at, p.updated_at
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
            if (client) { client.release(); }
        }
    });

    // ==========================================================
    // 상품 수정 라우트 (PUT /admin/products/:id)
    // ==========================================================
    router.put('/products/:id', authMiddleware, adminMiddleware, uploadProductMiddleware.single('image'), async (req, res) => {
        let client;
        const { id } = req.params;
        let imageUrlFromSupabase = null;
        let oldImageUrlToDelete = null;

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const { name, category, price, stock, description, is_available, is_monthly_menu, is_signature_menu, image } = req.body;

            const oldProductResult = await client.query('SELECT * FROM products WHERE id = $1', [id]);
            const oldProduct = oldProductResult.rows[0];

            if (!oldProduct) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '수정할 상품을 찾을 수 없습니다.' });
            }

            if (req.file) {
                const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
                const { data, error } = await supabase.storage
                    .from(productBucketName)
                    .upload(fileName, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert: false
                    });

                if (error) {
                    await client.query('ROLLBACK');
                    console.error('Supabase 파일 업로드 오류:', error);
                    return res.status(500).json({ success: false, message: `이미지 업로드 중 오류 발생: ${error.message}` });
                }

                const { data: publicUrlData } = supabase.storage
                    .from(productBucketName)
                    .getPublicUrl(fileName);

                imageUrlFromSupabase = publicUrlData.publicUrl;
                
                if (oldProduct.image_url) {
                    oldImageUrlToDelete = oldProduct.image_url;
                }
            } else if (image === 'null') {
                imageUrlFromSupabase = null;
                if (oldProduct.image_url) {
                    oldImageUrlToDelete = oldProduct.image_url;
                }
            } else {
                imageUrlFromSupabase = oldProduct.image_url;
            }

            const finalName = name !== undefined ? name : oldProduct.name;
            const finalDescription = description !== undefined ? description : oldProduct.description;
            const finalPrice = price !== undefined ? parseInt(price) : oldProduct.price;
            const finalStock = stock !== undefined ? parseInt(stock) : oldProduct.stock_quantity;
            
            const finalIsAvailable = (is_available !== undefined && is_available !== null)
                                            ? (is_available === 'true')
                                            : oldProduct.is_available;
            const finalIsMonthlyMenu = (is_monthly_menu !== undefined && is_monthly_menu !== null)
                                            ? (is_monthly_menu === 'true')
                                            : oldProduct.is_monthly_menu;
            const finalIsSignatureMenu = (is_signature_menu !== undefined && is_signature_menu !== null)
                                                 ? (is_signature_menu === 'true')
                                                 : oldProduct.is_signature_menu;

            let finalCategoryId = oldProduct.category_id;
            if (category) {
                const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
                if (categoryResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    if (imageUrlFromSupabase && req.file) {
                        const fileNameToDelete = path.basename(new URL(imageUrlFromSupabase).pathname);
                        await supabase.storage.from(productBucketName).remove([fileNameToDelete]);
                    }
                    return res.status(400).json({ success: false, message: '유효하지 않은 카테고리입니다.' });
                }
                finalCategoryId = categoryResult.rows[0].id;
            }

            const updateQuery = `
                UPDATE products
                SET
                    name = $1, description = $2, price = $3, stock_quantity = $4, category_id = $5,
                    image_url = $6, is_available = $7, is_monthly_menu = $8, is_signature_menu = $9,
                    updated_at = NOW()
                WHERE id = $10
                RETURNING *;
            `;
            const values = [
                finalName, finalDescription, finalPrice, finalStock, finalCategoryId,
                imageUrlFromSupabase, finalIsAvailable, finalIsMonthlyMenu, finalIsSignatureMenu, id
            ];

            const { rows } = await client.query(updateQuery, values);
            await client.query('COMMIT');

            if (oldImageUrlToDelete) {
                const fileNameToDelete = path.basename(new URL(oldImageUrlToDelete).pathname);
                await supabase.storage.from(productBucketName).remove([fileNameToDelete]);
            }

            const updatedProduct = formatProductResponse(rows[0]);
            res.status(200).json({ success: true, message: '상품이 성공적으로 수정되었습니다.', product: updatedProduct });

        } catch (error) {
            if (client) { await client.query('ROLLBACK'); }
            if (imageUrlFromSupabase && req.file) {
                const fileNameToDelete = path.basename(new URL(imageUrlFromSupabase).pathname);
                await supabase.storage.from(productBucketName).remove([fileNameToDelete]);
            }
            console.error('상품 수정 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '상품 수정 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) { client.release(); }
        }
    });

    // ==========================================================
    // 상품 상태 부분 수정 라우트 (PATCH /admin/products/:id/status)
    // ==========================================================
    router.patch('/products/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        const { id } = req.params;
        const { is_available, is_monthly_menu, is_signature_menu } = req.body;

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const oldProductResult = await client.query('SELECT is_available, is_monthly_menu, is_signature_menu FROM products WHERE id = $1', [id]);
            if (oldProductResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
            }

            const updateFields = [];
            const updateParams = [];
            let paramIndex = 1;

            if (is_available !== undefined) {
                updateFields.push(`is_available = $${paramIndex++}`);
                updateParams.push(is_available);
            }
            if (is_monthly_menu !== undefined) {
                updateFields.push(`is_monthly_menu = $${paramIndex++}`);
                updateParams.push(is_monthly_menu);
            }
            if (is_signature_menu !== undefined) {
                updateFields.push(`is_signature_menu = $${paramIndex++}`);
                updateParams.push(is_signature_menu);
            }

            if (updateFields.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: '업데이트할 필드가 없습니다.' });
            }
            
            const updateQuery = `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
            updateParams.push(id);

            const { rows } = await client.query(updateQuery, updateParams);
            await client.query('COMMIT');
            
            res.status(200).json({ success: true, message: '상품 상태가 성공적으로 업데이트되었습니다.', product: rows[0] });
            
        } catch (error) {
            if (client) { await client.query('ROLLBACK'); }
            console.error('상품 상태 업데이트 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '상품 상태 업데이트 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) { client.release(); }
        }
    });

    // ==========================================================
    // 상품 삭제 라우트 (DELETE /admin/products/:id)
    // ==========================================================
    router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        const { id } = req.params;
        let imageUrlFromSupabase = null;

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const imageResult = await client.query('SELECT image_url FROM products WHERE id = $1::uuid', [id]);
            const imageUrlToDeleteFromDb = imageResult.rows[0]?.image_url;
            imageUrlFromSupabase = imageUrlToDeleteFromDb;

            const deleteCartItemsQuery = 'DELETE FROM cart_items WHERE product_id = $1::uuid';
            await client.query(deleteCartItemsQuery, [id]);

            const deleteProductQuery = 'DELETE FROM products WHERE id = $1::uuid RETURNING *';
            const result = await client.query(deleteProductQuery, [id]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '삭제할 상품을 찾을 수 없습니다.' });
            }

            if (imageUrlFromSupabase) {
                const fileNameToDelete = path.basename(new URL(imageUrlFromSupabase).pathname);
                await supabase.storage.from(productBucketName).remove([fileNameToDelete]);
            }

            await client.query('COMMIT');
            res.status(200).json({ success: true, message: '상품이 성공적으로 삭제되었습니다.' });

        } catch (error) {
            if (client) { await client.query('ROLLBACK'); }
            console.error('상품 삭제 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '상품 삭제 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) { client.release(); }
        }
    });

    // ==========================================================
    // 사용자 목록 조회 라우트 (GET /admin/users)
    // ==========================================================
    router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const filterRole = req.query.role || '';
            const filterStatus = req.query.status || ''; 

            const offset = (page - 1) * limit;

            let query = `SELECT id, login_id, email, username, profile_image_url, phone_number, address, is_social_user, is_admin, created_at, updated_at, is_active FROM users`;
            let countQuery = `SELECT COUNT(*) FROM users`;
            const queryParams = [];
            const countParams = [];
            let paramIndex = 1;
            const conditions = [];

            if (search) {
                conditions.push(`(login_id ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`);
                queryParams.push(`%${search}%`);
                countParams.push(`%${search}%`);
                paramIndex++;
            }

            if (filterRole === 'user') {
                conditions.push(`is_admin = FALSE`);
            } else if (filterRole === 'admin') {
                conditions.push(`is_admin = TRUE`);
            }

            if (filterStatus === 'active') {
                conditions.push(`is_active = TRUE`);
            } else if (filterStatus === 'inactive') {
                conditions.push(`is_active = FALSE`);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
                countQuery += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
            queryParams.push(limit, offset);

            const [usersResult, countResult] = await Promise.all([
                client.query(query, queryParams),
                client.query(countQuery, countParams)
            ]);

            const totalUsers = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalUsers / limit);

            const usersWithFormattedData = usersResult.rows.map(user => formatUserResponse(user));

            res.json({
                success: true,
                users: usersWithFormattedData,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalUsers: totalUsers,
                    limit: limit
                }
            });

        } catch (error) {
            console.error('사용자 목록 조회 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '사용자 목록을 불러오는 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 특정 사용자 상세 조회 라우트 (GET /admin/users/:id)
    // ==========================================================
    router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        const { id } = req.params;
        try {
            client = await pool.connect();
            const userResult = await client.query(
                `SELECT id, login_id, email, username, profile_image_url, phone_number, address, is_social_user, is_admin, created_at, updated_at, is_active
                 FROM users WHERE id = $1`,
                [id]
            );

            const user = userResult.rows[0];

            if (!user) {
                return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
            }

            const formattedUser = formatUserResponse(user);

            res.status(200).json({
                success: true,
                user: formattedUser
            });

        } catch (error) {
            console.error('특정 사용자 조회 오류:', error);
            res.status(500).json({ success: false, message: '사용자 정보를 불러오는 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 사용자 정보 수정 라우트 (PUT /admin/users/:id)
    // ==========================================================
    router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        const { id } = req.params;
        const { username, email, phone_number, address, isAdmin, status } = req.body;

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const updateFields = [];
            const updateValues = [];
            let paramIndex = 1;

            if (username !== undefined) {
                updateFields.push(`username = $${paramIndex++}`);
                updateValues.push(username);
            }
            if (email !== undefined) {
                updateFields.push(`email = $${paramIndex++}`);
                updateValues.push(email);
            }
            if (phone_number !== undefined) {
                updateFields.push(`phone_number = $${paramIndex++}`);
                updateValues.push(phone_number);
            }
            if (address !== undefined) {
                updateFields.push(`address = $${paramIndex++}`);
                updateValues.push(address);
            }

            if (isAdmin !== undefined) {
                if (typeof isAdmin !== 'boolean') {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ success: false, message: 'isAdmin 값은 true 또는 false여야 합니다.' });
                }
                updateFields.push(`is_admin = $${paramIndex++}`);
                updateValues.push(isAdmin);
            }

            if (status !== undefined) {
                if (status !== 'active' && status !== 'inactive') {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ success: false, message: '유효하지 않은 상태 값입니다. (active 또는 inactive여야 합니다.)' });
                }
                const is_active_val = status === 'active';
                updateFields.push(`is_active = $${paramIndex++}`);
                updateValues.push(is_active_val);
            }

            if (updateFields.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: '업데이트할 필드가 없습니다.' });
            }

            updateFields.push(`updated_at = NOW()`);
            updateValues.push(id);

            const updateQuery = `
                UPDATE users
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING id, login_id, email, username, profile_image_url, phone_number, address, is_social_user, is_admin, created_at, updated_at, is_active;
            `;

            const result = await client.query(updateQuery, updateValues);
            await client.query('COMMIT');

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: '사용자를 찾을 수 없거나 업데이트할 정보가 없습니다.' });
            }

            const updatedUser = formatUserResponse(result.rows[0]);

            res.status(200).json({
                success: true,
                message: '사용자 정보가 성공적으로 수정되었습니다.',
                user: updatedUser
            });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }

            console.error('사용자 정보 수정 오류:', error);
            if (error.code === '23505') { 
                return res.status(400).json({ success: false, message: '이미 사용 중인 이메일 또는 로그인 ID입니다.' });
            } else if (error.message.includes("violates not-null constraint")) {
                return res.status(400).json({ success: false, message: '필수 필드가 비어있습니다. 입력값을 확인해주세요.' });
            }
            res.status(500).json({ success: false, message: '사용자 정보 수정 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 사용자 상태 변경 라우트 (PUT /admin/users/:id/status)
    // ==========================================================
    router.put('/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: 'is_active 값은 true 또는 false여야 합니다.' });
        }

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const updatedUserResult = await client.query(
                `UPDATE users
                 SET is_active = $1, updated_at = NOW()
                 WHERE id = $2
                 RETURNING id, login_id, email, username, profile_image_url, phone_number, address, is_social_user, is_admin, created_at, updated_at, is_active`,
                [is_active, id]
            );

            if (updatedUserResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '사용자를 찾을 수 없거나 상태를 업데이트할 수 없습니다.' });
            }

            await client.query('COMMIT');
            const updatedUser = formatUserResponse(updatedUserResult.rows[0]);

            res.status(200).json({
                success: true,
                message: `사용자 상태가 ${is_active ? '활성' : '비활성'}으로 업데이트되었습니다.`,
                user: updatedUser
            });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error(`사용자 ${id} 상태 업데이트 실패:`, error);
            res.status(500).json({ success: false, message: '사용자 상태 업데이트 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 사용자 역할 변경 라우트 (PUT /admin/users/:id/role)
    // ==========================================================
    router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        const { id } = req.params;
        const { is_admin } = req.body; 

        if (typeof is_admin !== 'boolean') {
            return res.status(400).json({ success: false, message: 'is_admin 값은 true 또는 false여야 합니다.' });
        }

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const updatedUserResult = await client.query(
                `UPDATE users
                 SET is_admin = $1, updated_at = NOW()
                 WHERE id = $2
                 RETURNING id, login_id, email, username, profile_image_url, phone_number, address, is_social_user, is_admin, created_at, updated_at, is_active`,
                [is_admin, id]
            );

            if (updatedUserResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '사용자를 찾을 수 없거나 역할을 업데이트할 수 없습니다.' });
            }

            await client.query('COMMIT');
            const updatedUser = formatUserResponse(updatedUserResult.rows[0]);

            res.status(200).json({
                success: true,
                message: `사용자 역할이 ${is_admin ? '관리자' : '일반 사용자'}로 업데이트되었습니다.`,
                user: updatedUser
            });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error(`사용자 ${id} 역할 업데이트 실패:`, error);
            res.status(500).json({ success: false, message: '사용자 역할 업데이트 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 사용자 삭제 라우트 (DELETE /admin/users/:id)
    // ==========================================================
    router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        const { id } = req.params;
        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const userImageResult = await client.query('SELECT profile_image_url FROM users WHERE id = $1', [id]);
            const imageUrlToDelete = userImageResult.rows[0] ? userImageResult.rows[0].profile_image_url : null;

            const deleteResult = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

            if (deleteResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '삭제할 사용자를 찾을 수 없습니다.' });
            }

            if (imageUrlToDelete) {
                // Supabase를 사용하므로 safeUnlink 대신 Supabase Storage API를 사용해야 합니다.
                const fileNameToDelete = path.basename(new URL(imageUrlToDelete).pathname);
                await supabase.storage.from(productBucketName).remove([fileNameToDelete]);
            }

            await client.query('COMMIT');
            res.status(200).json({ success: true, message: '사용자가 성공적으로 삭제되었습니다.' });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error('사용자 삭제 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '사용자 삭제 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 주문 목록 조회 라우트 (GET /admin/orders)
    // ==========================================================
    router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        try {
            client = await pool.connect();

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || ''; 
            const filterStatus = req.query.status || ''; 

            const offset = (page - 1) * limit;

            const conditions = [];
            const queryParams = [];
            const countParams = [];
            let paramIndex = 1;

            if (search) {
                conditions.push(`(o.id::text ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex})`);
                queryParams.push(`%${search}%`);
                countParams.push(`%${search}%`);
                paramIndex++;
            }
            if (filterStatus) {
                conditions.push(`o.status = $${paramIndex}`);
                queryParams.push(filterStatus);
                countParams.push(filterStatus);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

            let query = `
                SELECT
                    o.id,
                    o.user_id,
                    u.username AS customer_name,
                    o.order_date,
                    o.total_amount,
                    o.status,
                    o.shipping_address,
                    o.payment_method,
                    o.created_at,
                    o.updated_at
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ${whereClause}
                ORDER BY o.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;

            queryParams.push(limit, offset);

            let countQuery = `SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id ${whereClause}`;

            const [ordersResult, countResult] = await Promise.all([
                client.query(query, queryParams),
                client.query(countQuery, countParams)
            ]);

            const totalOrders = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalOrders / limit);

            const formattedOrders = ordersResult.rows.map(order => ({
                id: order.id,
                orderNumber: order.id, 
                customerName: order.customer_name,
                orderDate: order.order_date,
                totalAmount: order.total_amount, 
                status: order.status,
            }));

            res.json({
                success: true,
                orders: formattedOrders, 
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalOrders: totalOrders,
                    limit: limit
                }
            });

        } catch (error) {
            console.error('주문 목록 조회 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '주문 목록을 불러오는 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 예약 목록 조회 라우트 (GET /admin/reservations)
    // ==========================================================
    router.get('/reservations', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        try {
            client = await pool.connect();

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const filterDate = req.query.date || ''; 
            const filterStatus = req.query.status || '';

            const offset = (page - 1) * limit;

            const conditions = [];
            const queryParams = [];
            const countParams = [];
            let paramIndex = 1;

            if (search) {
                conditions.push(`(u.username ILIKE $${paramIndex} OR r.id::text ILIKE $${paramIndex})`);
                queryParams.push(`%${search}%`);
                countParams.push(`%${search}%`);
                paramIndex++;
            }
            if (filterDate) {
                conditions.push(`r.reservation_date = $${paramIndex}`);
                queryParams.push(filterDate);
                countParams.push(filterDate);
                paramIndex++;
            }
            if (filterStatus) {
                conditions.push(`r.status = $${paramIndex}`);
                queryParams.push(filterStatus);
                countParams.push(filterStatus);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

            let query = `
                SELECT
                    r.id,
                    r.user_id,
                    u.username AS customer_name,
                    r.product_id,
                    p.name AS product_name,
                    r.reservation_date,
                    r.reservation_time,
                    r.num_participants,
                    r.status,
                    r.notes,
                    r.created_at,
                    r.updated_at
                FROM reservations r
                JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                ${whereClause}
                ORDER BY r.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;
            queryParams.push(limit, offset);

            let countQuery = `SELECT COUNT(*) FROM reservations r JOIN users u ON r.user_id = u.id LEFT JOIN products p ON r.product_id = p.id ${whereClause}`;

            const [reservationsResult, countResult] = await Promise.all([
                client.query(query, queryParams),
                client.query(countQuery, countParams)
            ]);

            const totalReservations = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalReservations / limit);

            const formattedReservations = reservationsResult.rows.map(reservation => ({
                id: reservation.id,
                customer_name: reservation.customer_name,
                reservation_date: reservation.reservation_date, 
                reservation_time: reservation.reservation_time, 
                num_participants: reservation.num_participants,
                status: reservation.status,
                product_name: reservation.product_name || 'N/A', 
                notes: reservation.notes,
                created_at: reservation.created_at,
                updated_at: reservation.updated_at
            }));

            res.json({
                success: true,
                reservations: formattedReservations,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalReservations: totalReservations,
                    limit: limit
                }
            });

        } catch (error) {
            console.error('예약 목록 조회 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '예약 목록을 불러오는 중 서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // ==========================================================
    // 예약 상태 업데이트 라우트 (PUT /admin/reservations/:id/status)
    // ==========================================================
    router.put('/reservations/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: '유효하지 않은 예약 상태입니다.' });
            }

            const result = await client.query(
                `UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: '해당 예약을 찾을 수 없습니다.' });
            }

            res.json({ success: true, message: `예약 ${id}의 상태가 ${status}로 변경되었습니다.`, reservation: result.rows[0] });

        } catch (error) {
            console.error('예약 상태 업데이트 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '예약 상태 업데이트에 실패했습니다.', detailedError: error.message });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    return router;
};