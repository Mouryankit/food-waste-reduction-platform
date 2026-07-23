const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided.' });
    }

    // Verify signature & check expiration automatically
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ message: 'Access Denied: Invalid or expired token.' });
        }

        // Token is valid; attach user profile data to request object
        req.user = decodedUser;
        // console.log(req.user); 
        next(); 
    });
}

module.exports = verifyToken; 
