const bcrypt = require('bcrypt');
const User = require("../models/User.js"); 
const jwt = require('jsonwebtoken');
const plainToHashPassword = require("../utils/hash.js"); 

const signup = async (req, res) => {

    const {username, email, password, role, location} = req.body;  
    if(!username || !email || !password || !role || !location){
        return res.status(401).json({
            "message": "data is missing"
        })
    }
    const hashedPassword = await plainToHashPassword(password); 

    try { 
        const validUser = new User({
            name: username,
            email: email,
            password: hashedPassword,
            role: role,
            location: location     
        });

        const savedUser = await validUser.save(); 

        return res.status(201).json({"message": "Signup sucessfull"}); 
    }
    catch(err) {
        return res.status(400).json({"message": "user already exist", "error": err}); 
    }
}

const login = async (req, res) => {
    const {email, password, role} = req.body; 
    if(!email || !password || !role) return res.json({"message":"email, password and role is required"}); 

    try{
        const user = await User.findOne({ email: email });
        // console.log(user);
        // console.log(req.body); 
        if(!user) return res.json({"message":"enter valid email"}); 
        const isMatch = await bcrypt.compare(password, user.password); 
        // console.log(isMatch); 
        if(isMatch && user.role == role){
            const secretKey = process.env.JWT_SECRET;
            const payload = {
                id: user._id, 
                role: user.role, 
                location: user.location
            };
            const token = jwt.sign(payload, secretKey, {
                expiresIn: '1d'
            });

            res.status(200)
                .json({
                    "message": "login successful",
                    "token": token
                }); 
        }
        else {
            res.status(401).json({
                "message": "enter correct password"
            })
        }
    }
    catch(err){
        return res.json({
            "error": err
        })
    }
}

module.exports = {signup, login};

