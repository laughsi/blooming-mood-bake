// hash_password.js
const bcrypt = require('bcryptjs');

const passwordToHash = 'a123456789'; 

bcrypt.hash(passwordToHash, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed Password:', hash);
    console.log('Use this hash in your SQL INSERT/UPDATE query.');
});