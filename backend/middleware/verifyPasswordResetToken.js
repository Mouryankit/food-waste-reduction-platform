const jwt = require("jsonwebtoken");
const logger = require("../utils/logger.js");

const verifyPasswordResetToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader?.split(' ')[1]; // Extract token from Bearer <token>
    const token = bearerToken || req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'Token missing.' });
    }

    const secretKey = process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secretKey);
        req.body.email = decoded.email;
        next();
    }
    catch (err) {
        logger.error(`Password reset token verification failed: ${err.message}`);

        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }
        next(err);
    }
}

module.exports = verifyPasswordResetToken;
