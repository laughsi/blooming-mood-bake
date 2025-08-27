const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

module.exports = (supabase, profileBucketName, isProduction) => {

    const localStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, '..', 'uploads', 'profile_images');
            
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const originalName = file.originalname;
            cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(originalName)}`);
        }
    });

    const memoryStorage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: Only images (jpeg, jpg, png, gif) are allowed!"));
    };

    const multerUpload = multer({
        storage: isProduction ? memoryStorage : localStorage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 파일 크기 제한
        fileFilter: fileFilter
    });

    const supabaseUpload = async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        const { file } = req;
        const bucketName = profileBucketName;
        const filePath = `profile_images/${uuidv4()}-${file.originalname}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false 
                });

            if (uploadError) {
                console.error('Supabase 업로드 오류:', uploadError);
                return res.status(500).json({ success: false, message: '이미지 업로드에 실패했습니다.', detailedError: uploadError.message });
            }

            const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

            if (!publicData || !publicData.publicUrl) {
                console.error('Supabase Public URL 오류: publicUrl이 없습니다.');
                return res.status(500).json({ success: false, message: '이미지 URL을 가져오는 데 실패했습니다.' });
            }

            req.file_url = publicData.publicUrl;
            console.log('Supabase 프로필 이미지 업로드 성공:', req.file_url);
            next();
        } catch (error) {
            console.error('Supabase 업로드 미들웨어 오류:', error);
            res.status(500).json({ success: false, message: '서버 내부 오류로 이미지 업로드에 실패했습니다.', detailedError: error.message });
        }
    };

    const uploadProfileImage = (req, res, next) => {
        multerUpload.single('profile_image')(req, res, async (err) => {
            if (err) {
                console.error('Multer 에러:', err);
                return res.status(400).json({ success: false, message: err.message });
            }
            if (isProduction) {
                await supabaseUpload(req, res, next);
            } else {
                if (req.file) {
                    req.file_url = `/uploads/profile_images/${req.file.filename}`;
                }
                next(); 
            }
        });
    };

    return uploadProfileImage;
};