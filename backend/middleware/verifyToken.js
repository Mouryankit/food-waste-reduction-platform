const jwt = require('jsonwebtoken');
const logger = require("../utils/logger"); 

function verifyToken(req, res, next) {

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ "success": false, "message": 'Access Denied: No token provided.' });
    }
    try {
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUser;
        next();
    }
    catch(err) {
        logger.error(`Token verification failed: ${err.message}`);

        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: 'Access Denied: Invalid or expired token.'
            });
        }

        next(err); 
    }
}

module.exports = verifyToken; 
