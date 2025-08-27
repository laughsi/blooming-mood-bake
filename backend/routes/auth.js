const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

module.exports = (pool, JWT_SECRET_KEY, uploadProfileImageMiddleware, supabase, profileBucketName, isProduction, authMiddleware) => {

    // 1. 회원가입 (Register) 라우트
    router.post('/register', async (req, res) => {
        const { login_id, email, password, username } = req.body;

        if (!login_id || !email || !password) {
            return res.status(400).json({ success: false, message: '아이디, 이메일, 비밀번호는 필수 입력 사항입니다.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: '비밀번호는 6자 이상이어야 합니다.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: '유효한 이메일 주소를 입력해주세요.' });
        }

        try {
            const idExists = await pool.query('SELECT 1 FROM users WHERE login_id = $1', [login_id]);
            if (idExists.rows.length > 0) {
                return res.status(409).json({ success: false, message: '이미 사용 중인 아이디입니다.' });
            }

            const emailExists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
            if (emailExists.rows.length > 0) {
                return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            const result = await pool.query(
                'INSERT INTO users (login_id, email, password_hash, username, is_admin) VALUES ($1, $2, $3, $4, FALSE) RETURNING id, login_id, email, username, is_admin',
                [login_id, email, hashedPassword, username || null]
            );

            res.status(201).json({ success: true, message: '회원가입 성공', user: result.rows[0] });

        } catch (error) {
            console.error('회원가입 오류:', error);
            res.status(500).json({ success: false, message: '서버 오류 발생' });
        }
    });

    // 2. 로그인 (Login) 라우트
    router.post('/login', async (req, res) => {
        const { login_id, password } = req.body;

        if (!login_id || !password) {
            return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
        }

        try {
            const userResult = await pool.query('SELECT id, login_id, email, password_hash, username, is_social_user, is_admin FROM users WHERE login_id = $1', [login_id]);
            const user = userResult.rows[0];

            if (!user) {
                return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
            }

            if (user.is_social_user) {
                return res.status(401).json({ message: '이 계정은 소셜 계정으로 가입되었습니다. 소셜 로그인으로 시도해주세요.' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) {
                return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
            }

            const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, JWT_SECRET_KEY, { expiresIn: '7d' }); 

            res.json({
                success: true,
                message: '로그인 성공!',
                token,
                user: {
                    id: user.id,
                    login_id: user.login_id,
                    email: user.email,
                    username: user.username,
                    isAdmin: user.is_admin
                }
            });
        } catch (error) {
            console.error('로그인 중 서버 오류:', error);
            res.status(500).json({ message: '로그인 중 서버 오류가 발생했습니다.' });
        }
    });

    // 3. 소셜 로그인 콜백 (구현 예정)
    router.get('/social/:provider/callback', async (req, res) => {
        res.status(501).json({ message: '소셜 로그인 기능은 아직 구현되지 않았습니다.' });
    });

    // 4. 비밀번호 재설정 요청 (이메일 전송) 라우트 (구현 예정)
    router.post('/forgot-password', async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: '이메일 주소를 입력해주세요.' });
        }
        try {
            const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
            const user = userResult.rows[0];
            if (!user) {
                console.log(`[비밀번호 재설정] 존재하지 않는 이메일 요청: ${email}`);
                return res.json({ success: true, message: '비밀번호 재설정 링크가 이메일로 전송되었습니다. (만약 해당 이메일이 존재한다면)' });
            }
            console.log(`[비밀번호 재설정] 요청 성공: ${email}`);
            res.json({ success: true, message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' });
        } catch (error) {
            console.error('비밀번호 재설정 요청 오류:', error);
            res.status(500).json({ message: '비밀번호 재설정 요청 중 서버 오류가 발생했습니다.' });
        }
    });

    // 5. 프로필 업데이트 라우트
    router.put('/profile', authMiddleware, uploadProfileImageMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { email, username, phone_number, address, current_password, new_password, profile_image } = req.body;
        const profileImageUrl = req.file_url;

        try {
            const userResult = await pool.query('SELECT password_hash, profile_image_url FROM users WHERE id = $1', [userId]);
            const user = userResult.rows[0];

            if (!user) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            if (current_password && new_password) {
                const isMatch = await bcrypt.compare(current_password, user.password_hash);
                if (!isMatch) {
                    return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
                }
                if (new_password.length < 8) {
                    return res.status(400).json({ message: '새 비밀번호는 최소 8자 이상이어야 합니다.' });
                }
                const newPasswordHash = await bcrypt.hash(new_password, 10);
                await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
            }

            let newProfileImageUrl = user.profile_image_url;

            if (profileImageUrl) {
                if (isProduction && user.profile_image_url) {
                    const existingFileName = path.basename(user.profile_image_url);
                    const { error: deleteError } = await supabase.storage
                        .from(profileBucketName)
                        .remove([`profile_images/${existingFileName}`]);
                    if (deleteError) {
                        console.error('기존 프로필 이미지 삭제 오류:', deleteError);
                    }
                }
                newProfileImageUrl = profileImageUrl;
            } else if (profile_image === 'REMOVE') {
                if (user.profile_image_url) {
                    if (isProduction) {
                        const existingFileName = path.basename(user.profile_image_url);
                        const { error: deleteError } = await supabase.storage
                            .from(profileBucketName)
                            .remove([`profile_images/${existingFileName}`]);
                        if (deleteError) {
                            console.error('프로필 이미지 삭제 오류:', deleteError);
                        }
                    } else {
                        const oldImagePath = path.join(__dirname, '..', user.profile_image_url);
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath);
                        }
                    }
                }
                newProfileImageUrl = null;
            }

            const updateFields = { email, username, phone_number, address, profile_image_url: newProfileImageUrl };
            
            const queryFields = [];
            const queryValues = [];

            if (updateFields.email !== undefined) {
                queryFields.push('email');
                queryValues.push(updateFields.email);
            }
            if (updateFields.username !== undefined) {
                queryFields.push('username');
                queryValues.push(updateFields.username);
            }
            if (updateFields.phone_number !== undefined) {
                queryFields.push('phone_number');
                queryValues.push(updateFields.phone_number);
            }
            if (updateFields.address !== undefined) {
                queryFields.push('address');
                queryValues.push(updateFields.address);
            }
            if (newProfileImageUrl !== user.profile_image_url) {
                queryFields.push('profile_image_url');
                queryValues.push(newProfileImageUrl);
            }

            if (queryFields.length > 0) {
                const setClause = queryFields.map((key, index) => `${key} = $${index + 1}`).join(', ');
                await pool.query(`UPDATE users SET ${setClause} WHERE id = $${queryFields.length + 1}`, [...queryValues, userId]);
            }

            const updatedUserResult = await pool.query('SELECT id, login_id, email, username, phone_number, address, profile_image_url FROM users WHERE id = $1', [userId]);
            const updatedUser = updatedUserResult.rows[0];

            res.json({ success: true, message: '프로필이 성공적으로 업데이트되었습니다.', user: updatedUser });

        } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            if (error.message.includes('프로필 이미지 파일')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: '프로필 업데이트 중 서버 오류가 발생했습니다.' });
        }
    });

    return router;
};