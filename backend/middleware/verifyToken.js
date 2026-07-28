const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ message: 'Access Denied: Invalid or expired token.' });
        }
        // console.log(decodedUser); 
        req.user = decodedUser; 
        next(); 
    });
}

module.exports = verifyToken; 
