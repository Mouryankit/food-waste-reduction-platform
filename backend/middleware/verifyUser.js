const User = require("../models/User");
const verifyUser = async (req, res, next) => {
    // console.log(req.user); 
    // console.log("working"); 
    const result = await User.findOne({_id: req.user.id}); 
    // console.log(result); 
    if(!result.valid){
        return res.json({
            "message": "you are blocked by the Admin"
        })
    }
    next(); 
}

module.exports = verifyUser; 