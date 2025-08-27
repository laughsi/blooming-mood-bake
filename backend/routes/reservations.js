// backend/routes/reservations.js
const express = require('express');
const router = express.Router();

module.exports = (pool, authMiddleware, adminMiddleware) => {

    // ==========================================================
    // ✨ 1. 관리자용 예약 목록 조회 (GET /api/reservations/admin)
    router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            const { page = 1, search = '', date = '', status = '', limit = 10 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let queryText = `
                SELECT
                    r.id,
                    r.user_id,
                    r.customer_name,
                    u.email AS customer_email,
                    r.phone_number,
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
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                WHERE 1=1
            `;
            let countQueryText = `
                SELECT COUNT(*) FROM reservations r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE 1=1
            `;
            const queryParams = [];
            const countParams = [];
            let paramIndex = 1;

            if (search) {
                queryText += ` AND (r.customer_name ILIKE $${paramIndex} OR r.id::text ILIKE $${paramIndex})`;
                countQueryText += ` AND (r.customer_name ILIKE $${paramIndex} OR r.id::text ILIKE $${paramIndex})`;
                queryParams.push(`%${search}%`);
                countParams.push(`%${search}%`);
                paramIndex++;
            }
            if (date) {
                queryText += ` AND r.reservation_date = $${paramIndex}`;
                countQueryText += ` AND r.reservation_date = $${paramIndex}`;
                queryParams.push(date);
                countParams.push(date);
                paramIndex++;
            }
            if (status) {
                queryText += ` AND r.status = $${paramIndex}`;
                countQueryText += ` AND r.status = $${paramIndex}`;
                queryParams.push(status);
                countParams.push(status);
                paramIndex++;
            }

            queryText += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            queryParams.push(parseInt(limit), offset);

            const [reservationsResult, countResult] = await Promise.all([
                client.query(queryText, queryParams),
                client.query(countQueryText, countParams)
            ]);

            const totalItems = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalItems / parseInt(limit));

            res.json({
                success: true,
                reservations: reservationsResult.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: totalPages,
                    totalItems: totalItems,
                    limit: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('관리자 예약 목록 조회 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    // ==========================================================
    // ✨ 2. 특정 예약 조회 (이름과 전화번호로) - GET /api/reservations/lookup
    router.get('/lookup', async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            const { customerName, phoneNumber } = req.query;

            if (!customerName || !phoneNumber) {
                return res.status(400).json({ success: false, message: '예약자 이름과 연락처를 모두 입력해주세요.' });
            }

            const queryText = `
                SELECT
                    r.id,
                    r.user_id,
                    r.customer_name,
                    COALESCE(u.email, 'N/A') AS customer_email,
                    r.phone_number,
                    r.product_id,
                    p.name AS product_name,
                    p.description AS product_description,
                    r.reservation_date,
                    r.reservation_time,
                    r.num_participants,
                    r.status,
                    r.notes,
                    r.created_at,
                    r.updated_at
                FROM reservations r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                WHERE r.customer_name = $1 AND r.phone_number = $2
                ORDER BY r.reservation_date DESC, r.reservation_time DESC;
            `;
            const result = await client.query(queryText, [customerName, phoneNumber]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: '해당 정보로 예약된 내역을 찾을 수 없습니다.' });
            }

            res.json({ success: true, reservations: result.rows });

        } catch (error) {
            console.error('예약 조회 오류 (이름/전화번호):', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    // ==========================================================
    // 로그인한 사용자 자신의 예약 목록 조회 (GET /api/reservations/user/:userId)
    router.get('/user/:userId', authMiddleware, async (req, res) => {
        const userId = req.params.userId; 
        const authenticatedUserId = req.user.id; 

        if (userId !== authenticatedUserId) {
            console.warn(`[SECURITY] User ${authenticatedUserId} attempted to access reservations for user ${userId}`);
            return res.status(403).json({ success: false, message: '다른 사용자의 예약 내역에 접근할 수 없습니다.' });
        }

        let client;
        try {
            client = await pool.connect();
            const queryText = `
                SELECT
                    r.id,
                    r.user_id,
                    r.customer_name,
                    COALESCE(u.email, 'N/A') AS customer_email,
                    r.phone_number,
                    r.product_id,
                    p.name AS product_name,
                    p.description AS product_description,
                    r.reservation_date,
                    r.reservation_time,
                    r.num_participants,
                    r.status,
                    r.notes,
                    r.created_at,
                    r.updated_at
                FROM reservations r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                WHERE r.user_id = $1 -- 로그인한 사용자의 ID로 필터링
                ORDER BY r.reservation_date DESC, r.reservation_time DESC;
            `;
            const result = await client.query(queryText, [userId]);

            if (result.rows.length === 0) {
                return res.status(200).json({ success: true, message: '예약 내역이 없습니다.', data: [] });
            }

            res.json({ success: true, message: '예약 내역을 성공적으로 불러왔습니다.', data: result.rows });

        } catch (error) {
            console.error('사용자 예약 내역 조회 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    // ==========================================================
    // ✨ 3. 특정 예약 상세 정보 가져오기 (GET /api/reservations/:id)
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        let client;
        try {
            client = await pool.connect();

            let queryText = `
                SELECT
                    r.id,
                    r.user_id,
                    r.customer_name,
                    COALESCE(u.email, 'N/A') AS customer_email,
                    r.phone_number,
                    r.product_id,
                    p.name AS product_name,
                    p.description AS product_description,
                    r.reservation_date,
                    r.reservation_time,
                    r.num_participants,
                    r.status,
                    r.notes,
                    r.created_at,
                    r.updated_at
                FROM reservations r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN products p ON r.product_id = p.id
                WHERE r.id = $1
            `;
            const values = [id];

            const result = await client.query(queryText, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
            }
            res.json({ success: true, reservation: result.rows[0] });
        } catch (error) {
            console.error('예약 상세 조회 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    // ==========================================================
    // 4. 새 예약 생성 라우트 (POST /api/reservations)
    router.post('/', async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const { reservation_date, reservation_time, num_participants, notes, customerName, phoneNumber } = req.body;
            const product_id = null;
            const user_id = req.body.user_id || null;

            if (!reservation_date || !reservation_time || !num_participants || !customerName || !phoneNumber) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: '필수 예약 정보 (날짜, 시간, 인원 수, 예약자 이름, 연락처)가 누락되었습니다.' });
            }

            if (isNaN(num_participants) || parseInt(num_participants) < 1) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: '유효한 인원 수를 입력해주세요. (1명 이상)' });
            }

            const insertQuery = `
                INSERT INTO reservations (
                    user_id,
                    product_id,
                    reservation_date,
                    reservation_time,
                    num_participants,
                    notes,
                    status,
                    created_at,
                    updated_at,
                    customer_name,
                    phone_number
                ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $7, $8)
                RETURNING id, reservation_date, reservation_time, num_participants, status, customer_name, phone_number;
            `;
            const values = [
                user_id,
                product_id,
                reservation_date,
                reservation_time,
                parseInt(num_participants),
                notes || null,
                customerName,
                phoneNumber
            ];

            const result = await client.query(insertQuery, values);
            await client.query('COMMIT');

            res.status(201).json({ success: true, message: '예약이 성공적으로 신청되었습니다.', reservation: result.rows[0] });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error('예약 신청 중 오류 발생:', error);
            if (error.code === '23503') {
                let errorMessage = '데이터베이스 오류: 유효하지 않은 사용자 또는 상품 정보입니다.';
                if (error.detail && error.detail.includes('user_id')) {
                    errorMessage = '데이터베이스 오류: 유효하지 않은 사용자 ID입니다. 로그인 상태를 확인해주세요.';
                } else if (error.detail && error.detail.includes('product_id')) {
                    errorMessage = '데이터베이스 오류: 유효하지 않은 상품 ID입니다.';
                }
                return res.status(400).json({ success: false, message: errorMessage, detailedError: error.message });
            }
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    // 5. 일반 사용자 예약 상태 업데이트 (취소 기능) (PUT /api/reservations/:id/status)
    router.put('/:id/status', async (req, res) => {
        const { id } = req.params;
        const { status, customer_name, phone_number } = req.body;
        let client;

        if (status !== 'cancelled') {
            return res.status(400).json({ success: false, message: '예약 상태는 "cancelled"로만 변경할 수 있습니다.' });
        }

        if (!customer_name || !phone_number) {
            return res.status(400).json({ success: false, message: '예약을 취소하려면 예약자 이름과 연락처가 필요합니다.' });
        }

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const checkQuery = `
                SELECT id, user_id, customer_name, phone_number, status
                FROM reservations
                WHERE id = $1 AND customer_name = $2 AND phone_number = $3;
            `;
            const checkResult = await client.query(checkQuery, [id, customer_name, phone_number]);

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '예약을 찾을 수 없거나, 예약 정보가 일치하지 않습니다.' });
            }

            const currentReservation = checkResult.rows[0];

            if (['cancelled', 'completed'].includes(currentReservation.status)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: `이미 ${currentReservation.status === 'cancelled' ? '취소된' : '완료된'} 예약입니다.` });
            }

            const updateQuery = `
                UPDATE reservations
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, status, updated_at;
            `;
            const result = await client.query(updateQuery, [status, id]);

            await client.query('COMMIT');
            res.json({ success: true, message: '예약 상태가 성공적으로 취소(업데이트)되었습니다.', reservation: result.rows[0] });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error('예약 취소(상태 업데이트) 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    // ==========================================================
    // ✨ 5. 예약 삭제 라우트 (DELETE /api/reservations/:id) - 관리자 전용으로 수정
    router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => { 
        const { id } = req.params;
        let client;
        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const deleteQuery = `
                DELETE FROM reservations
                WHERE id = $1
                RETURNING id;
            `;
            const result = await client.query(deleteQuery, [id]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '삭제할 예약을 찾을 수 없습니다.' });
            }

            await client.query('COMMIT');
            res.json({ success: true, message: '예약이 성공적으로 삭제되었습니다.', deletedId: result.rows[0].id });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error('예약 삭제 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    // ==========================================================
    // 6. 관리자용 예약 상태 업데이트 (PUT /api/reservations/admin/:id/status)
    router.put('/admin/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        let client;

        const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: '유효하지 않은 예약 상태입니다.' });
        }

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const updateQuery = `
                UPDATE reservations
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, status;
            `;
            const result = await client.query(updateQuery, [status, id]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
            }

            await client.query('COMMIT');
            res.json({ success: true, message: '예약 상태가 성공적으로 업데이트되었습니다.', reservation: result.rows[0] });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error('예약 상태 업데이트 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', detailedError: error.message });
        } finally {
            if (client) client.release();
        }
    });

    return router;
};