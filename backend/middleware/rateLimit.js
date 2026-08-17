
const { rateLimit } = require("express-rate-limit");

const blockedUsers = new Map();

// Block duration: 3 hours in milliseconds
const BLOCK_DURATION = 3 * 60 *  60 * 1000; 

// Middleware to check blocked users
const checkBlockedUser = (req, res, next) => {
    const ip = req.ip;
    const blockedUntil = blockedUsers.get(ip);
    // console.log(ip); 
    if (!blockedUntil) {
        return next();
    }

    // Block expired
    if (Date.now() >= blockedUntil) {
        blockedUsers.delete(ip);
        return next();
    }

    const remainingTime = Math.ceil((blockedUntil - Date.now()) / 1000);

    return res.status(429).json({
        success: false,
        error: true,
        message: `Too many requests. You are blocked for ${Math.ceil(remainingTime / 60)} minute(s).`
    });
};

// 50 requests per minute
const apiRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 50,

    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,

    handler: (req, res) => {
        const ip = req.ip;

        // Block IP for the specified duration
        blockedUsers.set(ip, Date.now() + BLOCK_DURATION);

        // Prevent memory leak by cleaning up the IP from memory after the block expires
        setTimeout(() => {
            blockedUsers.delete(ip);
        }, BLOCK_DURATION);

        const durationInMinutes = BLOCK_DURATION / (60 * 1000);

        return res.status(429).json({
            success: false,
            error: true,
            message: `Too many requests. You are blocked for ${durationInMinutes} minutes.`
        });
    }
});

module.exports = {
    checkBlockedUser,
    apiRateLimit
};