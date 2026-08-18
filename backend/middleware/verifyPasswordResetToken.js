const jwt = require("jsonwebtoken"); 

const verifyPasswordResetToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer <token>
    const token = bearerToken || req.cookies.token || req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'Token missing.' });
    }

    const secretKey = process.env.JWT_SECRET; 

    try {
        const decoded = await jwt.verify(token, secretKey);
        req.body.email = decoded.email;
    } catch (err) {
        return res.status(401).json({
            message: err.message,
            name: err.name
        });
    }
    next();
}

module.exports = verifyPasswordResetToken;
 