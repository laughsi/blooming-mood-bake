// backend/routes/user.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

module.exports = (pool, uploadMiddleware, authMiddleware, uploadDir) => {
    const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:5000';
    const isProduction = process.env.NODE_ENV === 'production';

    let supabase;
    if (isProduction) {
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
    }

    const deleteImageFromSupabase = async (fileUrl) => {
        if (!fileUrl || !supabase) return;

        try {
            const filePath = fileUrl.split('public/')[1];
            if (!filePath) {
                console.error('Supabase 경로를 찾을 수 없습니다.');
                return;
            }
            const { error } = await supabase.storage.from('profile_images').remove([`public/${filePath}`]);
            if (error) {
                console.error('Supabase 이미지 삭제 오류:', error);
            } else {
                console.log('Supabase 이미지 삭제 성공:', fileUrl);
            }
        } catch (error) {
            console.error('Supabase 이미지 삭제 중 예외 발생:', error);
        }
    };

    // 1. 현재 사용자 정보 가져오기 (/api/user/me) 라우트
    router.get('/me', authMiddleware, async (req, res) => {
        try {
            const userResult = await pool.query('SELECT id, login_id, email, username, profile_image_url, phone_number, address, is_social_user, is_admin FROM users WHERE id = $1', [req.user.id]);
            const user = userResult.rows[0];

            if (!user) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            let formattedProfileImageUrl = null;
            if (user.profile_image_url) {
                if (isProduction) {
                    formattedProfileImageUrl = user.profile_image_url;
                } else {
                    const filename = path.basename(user.profile_image_url.replace(/\\/g, '/'));
                    formattedProfileImageUrl = `${BACKEND_BASE_URL}/uploads/profile_images/${filename}`;
                }
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    login_id: user.login_id,
                    email: user.email,
                    username: user.username,
                    profile_image_url: formattedProfileImageUrl,
                    phone_number: user.phone_number,
                    address: user.address,
                    is_social_user: user.is_social_user,
                    isAdmin: user.is_admin
                }
            });
        } catch (error) {
            console.error('사용자 정보 가져오기 오류:', error);
            res.status(500).json({ message: '사용자 정보를 불러오는 중 서버 오류가 발생했습니다.' });
        }
    });

    // 2. 사용자 프로필 정보 업데이트 라우트
    router.put('/profile', authMiddleware, uploadMiddleware, async (req, res) => {
        const { userId } = req.user;
        const { username, phone_number, address } = req.body;
        let profileImagePathForDb;
        let client;

        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const oldUserImageResult = await client.query('SELECT profile_image_url FROM users WHERE id = $1', [userId]);
            const oldProfileImageUrlInDb = oldUserImageResult.rows[0]?.profile_image_url;

            const deleteOldImage = async (imageUrl) => {
                if (!imageUrl) return;
                if (isProduction) {
                    await deleteImageFromSupabase(imageUrl);
                } else {
                    const filename = path.basename(imageUrl.replace(/\\/g, '/'));
                    const fullPathToDelete = path.join(uploadDir, filename);
                    if (fs.existsSync(fullPathToDelete)) {
                        fs.unlink(fullPathToDelete, (err) => {
                            if (err) console.error('이전 프로필 이미지 파일 삭제 오류:', err);
                            else console.log('이전 프로필 이미지 파일이 삭제되었습니다:', fullPathToDelete);
                        });
                    }
                }
            };

            if (req.file) {
                await deleteOldImage(oldProfileImageUrlInDb);
                profileImagePathForDb = req.file.path;
            } 
            else if (req.body.hasOwnProperty('profile_image_url') && req.body.profile_image_url === '') {
                await deleteOldImage(oldProfileImageUrlInDb);
                profileImagePathForDb = null;
            }
            else {
                profileImagePathForDb = oldProfileImageUrlInDb;
            }

            const updateFields = [];
            const updateValues = [];
            let paramIndex = 1;

            if (username !== undefined) {
                updateFields.push(`username = $${paramIndex++}`);
                updateValues.push(username);
            }
            if (phone_number !== undefined) {
                updateFields.push(`phone_number = $${paramIndex++}`);
                updateValues.push(phone_number);
            }
            if (address !== undefined) {
                updateFields.push(`address = $${paramIndex++}`);
                updateValues.push(address);
            }
            updateFields.push(`profile_image_url = $${paramIndex++}`);
            updateValues.push(profileImagePathForDb);

            if (updateFields.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: '업데이트할 정보가 없습니다.' });
            }

            updateValues.push(userId);
            
            const query = `
                UPDATE users 
                SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE id = $${paramIndex} 
                RETURNING id, login_id, email, username, profile_image_url, phone_number, address, is_admin`;

            const result = await client.query(query, updateValues);
            await client.query('COMMIT');

            if (result.rows.length === 0) {
                return res.status(404).json({ message: '사용자를 찾을 수 없거나 업데이트할 수 없습니다.' });
            }

            const updatedUser = result.rows[0];
            res.json({ success: true, message: '프로필이 성공적으로 업데이트되었습니다.', user: updatedUser });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            if (isProduction && req.file && req.file.path) {
                 await deleteImageFromSupabase(req.file.path);
            }
            console.error('프로필 업데이트 오류:', error);
            res.status(500).json({ message: '프로필 업데이트 중 서버 오류가 발생했습니다.' });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    // 3. 회원 탈퇴 (Delete Account) 라우트
    router.delete('/me', authMiddleware, async (req, res) => {
        const userIdToDelete = req.user.userId;

        if (!userIdToDelete) {
            return res.status(401).json({ message: '인증되지 않은 요청입니다. 사용자 ID를 확인할 수 없습니다.' });
        }

        let client;
        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const userImageResult = await client.query('SELECT profile_image_url FROM users WHERE id = $1', [userIdToDelete]);
            const currentImageUrlInDb = userImageResult.rows[0]?.profile_image_url;

            const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userIdToDelete]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: '사용자를 찾을 수 없거나 이미 탈퇴 처리되었습니다.' });
            }

            if (currentImageUrlInDb) {
                if (isProduction) {
                    await deleteImageFromSupabase(currentImageUrlInDb);
                } else {
                    const projectRootPath = path.join(__dirname, '..');
                    const fullPathToDelete = path.join(projectRootPath, currentImageUrlInDb);
                    if (fs.existsSync(fullPathToDelete)) {
                        fs.unlink(fullPathToDelete, (err) => {
                            if (err) console.error('회원 탈퇴 시 프로필 이미지 파일 삭제 오류:', err);
                            else console.log('회원 탈퇴 시 프로필 이미지 파일이 삭제되었습니다:', fullPathToDelete);
                        });
                    }
                }
            }

            await client.query('COMMIT');
            res.status(200).json({ message: '회원 탈퇴가 성공적으로 처리되었습니다.' });

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error('회원 탈퇴 중 오류:', error);
            res.status(500).json({ message: '서버 오류: 회원 탈퇴 중 문제가 발생했습니다.' });
        } finally {
            if (client) {
                client.release();
            }
        }
    });

    return router;
};