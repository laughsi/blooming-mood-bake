// backend/utils/upload.js
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let supabase;
if (isProduction) {
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );
}

const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'product_images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExtension);
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: fileFilter
});

const supabaseUpload = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const { file } = req;
    const bucketName = 'product_images';
    const filePath = `public/${uuidv4()}-${file.originalname}`;

    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false 
            });

        if (error) {
            console.error('Supabase 업로드 오류:', error);
            return res.status(500).json({ success: false, message: '이미지 업로드에 실패했습니다.', detailedError: error.message });
        }

        const { publicURL, error: urlError } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        if (urlError) {
             console.error('Supabase Public URL 오류:', urlError);
             return res.status(500).json({ success: false, message: '이미지 URL을 가져오는 데 실패했습니다.', detailedError: urlError.message });
        }

        req.file.path = publicURL;
        console.log('Supabase 이미지 업로드 성공:', publicURL);
        next();
    } catch (error) {
        console.error('Supabase 업로드 미들웨어 오류:', error);
        res.status(500).json({ success: false, message: '서버 내부 오류로 이미지 업로드에 실패했습니다.', detailedError: error.message });
    }
};

const uploadProduct = (req, res, next) => {
    multerUpload.single('image')(req, res, async (err) => {
        if (err) {
            console.error('Multer 에러:', err);
            return res.status(400).json({ success: false, message: err.message });
        }
        if (isProduction) {
            await supabaseUpload(req, res, next);
        } else {
            next();
        }
    });
};

module.exports = uploadProduct;