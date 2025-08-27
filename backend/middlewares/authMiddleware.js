// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (jwtSecretKey) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '인증 토큰이 제공되지 않았습니다.' });
        }

        const token = authHeader.split(' ')[1];

        if (!jwtSecretKey) {
            console.error('환경 변수 JWT_SECRET_KEY가 설정되지 않았습니다!');
            return res.status(500).json({ message: '서버 설정 오류: JWT 키가 누락되었습니다.' });
        }

        try {
            const decoded = jwt.verify(token, jwtSecretKey);
            
            req.user = decoded;
            next();
        } catch (error) {
            console.error('JWT 검증 오류:', error.name, error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
            }
            return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        }
    };
};