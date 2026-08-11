const { verify } = require("jsonwebtoken");
const jwt = require("jsonwebtoken"); 
const verifyPasswordResetToken = (req, res, next) => {

    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1]; // Extract token
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Token missing.' })
    const secretKey = process.env.JWT_SECRET; 

    jwt.verify(token, secretKey, function(err, decoded) {
        if (err) {
            return res.json({
                "message": err.message,
                "name": err.name
            })
        }
        // console.log(decoded);
        req.body.email = decoded.email;
    });
    next(); 
}

module.exports = verifyPasswordResetToken; 