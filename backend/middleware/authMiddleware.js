const jwt = require("jsonwebtoken");
const logger = require("../utils/logger.js");
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }

    try {
        let secret = process.env.JWT_SECRET
        const decoded = jwt.verify(
            token,
            secret
        );

        req.user = decoded;

        next();

    } catch (err) {
        logger.error("Authentication error:", err.message);

        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
        next(err);
    }
};

module.exports = authMiddleware;