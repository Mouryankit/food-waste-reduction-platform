const jwt = require("jsonwebtoken"); 
const generateToken = (email) => {
    const secretKey = process.env.JWT_SECRET;

    // Manually build a safe payload object
    const payload = { 
        email: email,
        allowPasswordReset: true // Hardcode the specific permission scope
    }; 

    // Sign the token with a short expiration time (e.g., 15 minutes)
    const token = jwt.sign(payload, secretKey, {
        expiresIn: '10m' 
    });
    return token; 
}

module.exports = generateToken; 