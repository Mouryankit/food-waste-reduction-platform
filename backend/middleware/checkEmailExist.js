const User = require("../models/User.js");
const logger = require("../utils/logger.js");

const checkEmailExist = async (req, res, next) => {
    // console.log(req.body); 
    // console.log("working");
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            next();
        }
        else {
            return res.status(404).json({
                "message": "user with this email does not exist"
            });
        }
    }
    catch (err) {
        logger.error(err); 
        next(err); 
    }
}

module.exports = checkEmailExist; 