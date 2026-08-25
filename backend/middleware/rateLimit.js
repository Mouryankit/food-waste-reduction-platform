
const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minutes
	limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive

	// Custom handler to forward the error to app.js global handler
	handler: (req, res) => {
		return res.status(429).json({
			"success": false,
			"message": "Too many requests, please try again later"
		})
	}
});

// Apply the rate limiting middleware to all requests.
module.exports = {
	limiter
};