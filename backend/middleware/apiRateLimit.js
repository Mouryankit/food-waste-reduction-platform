const { rateLimit } = require("express-rate-limit");

const apiRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    limit: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({
            success: false,
            error: true,
            message: "Too many requests. Please try again after some time."
        });
    }
});

// Apply the rate limiting middleware to all requests.
module.exports = apiRateLimit; 