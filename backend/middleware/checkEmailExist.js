const User = require("../models/User.js");

const checkEmailExist = async (req, res, next) => {
    // console.log(req.body); 
    // console.log("working");
    const {email} = req.body; 
    const user = await User.findOne({ email: email});
    // console.log("working");
    if(user){
       next();  
    }
    else {
        return res.status(401).json({
            "message": "user with this email does not exist"
        });
    }
}

module.exports = checkEmailExist; 