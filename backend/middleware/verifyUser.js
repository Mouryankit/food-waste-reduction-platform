const User = require("../models/User");
const logger = require("../utils/logger");

const verifyUser = async (req, res, next) => {
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            "success": false,
            "message": "Access Denied: Not authenticated"
        });
    }
    try {
        const userId = req.user.id;
        const result = await User.findOne({ _id: userId });
        if (!result) {
            return res.status(404).json({
                "success": false,
                "message": "User account not found."
            });
        }
        if (!result.valid) {
            return res.status(403).json({
                "success": false,
                "message": "you are blocked by the Admin"
            })
        }
        next();
    }
    catch (err) {
        logger.error(`verifyUser database error: ${err.message}`);
        next(err);
    }
}

module.exports = verifyUser; 