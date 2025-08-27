const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); 
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const { createClient } = require('@supabase/supabase-js');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const corsOptions = {
    origin: isProduction ? process.env.FRONTEND_URL : 'http://localhost:3000',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

pool.on('connect', () => {
    console.log('✅ PostgreSQL 데이터베이스에 성공적으로 연결되었습니다.');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL 연결 오류:', err.message, err.stack);
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase 클라이언트가 초기화되었습니다.');
} else {
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. 파일 업로드가 로컬에서 처리됩니다.');
}

const profileBucketName = process.env.SUPABASE_PROFILE_BUCKET_NAME;
const productBucketName = process.env.SUPABASE_PRODUCT_BUCKET_NAME;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authMiddleware = require('./middlewares/authMiddleware')(JWT_SECRET_KEY);
const createUploadProfileImageMiddleware = require('./middlewares/uploadProfileImage');
const uploadProfileImageMiddleware = createUploadProfileImageMiddleware(supabase, profileBucketName, isProduction);

const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
    next();
};

const authRoutes = require('./routes/auth')(pool, JWT_SECRET_KEY, uploadProfileImageMiddleware, supabase, profileBucketName, isProduction, authMiddleware);
const userRoutes = require('./routes/user')(pool, uploadProfileImageMiddleware, authMiddleware, 'profile_images');
const productRoutes = require('./routes/products')(pool, authMiddleware, adminMiddleware, supabase, productBucketName, isProduction);
const categoriesRoutes = require('./routes/categories');
const reservationsRoutes = require('./routes/reservations');
const adminRoutes = require('./routes/admin')(pool, authMiddleware, adminMiddleware, supabase, productBucketName); 
const orderRoutes = require('./routes/orders');
const ordersRoutesInstance = orderRoutes(pool, authMiddleware, adminMiddleware);
const cartRoutes = require('./routes/cart');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoriesRoutes(pool));
app.use('/api/reservations', reservationsRoutes(pool, authMiddleware, adminMiddleware));
app.use('/api/admin', adminRoutes);
app.use('/api/admin/orders', ordersRoutesInstance);
app.use('/api/cart', cartRoutes(pool, authMiddleware));

app.use((req, res, next) => {
    res.status(404).json({ success: false, message: '요청하신 리소스를 찾을 수 없습니다.' });
});

app.listen(PORT, () => {
    console.log(`✅ 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});