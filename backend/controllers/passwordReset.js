
const OTP = require("../models/otpSchema.js"); 
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

const generateToken = require("../utils/generateToken.js");

const plainToHashPassword = require("../utils/hash.js");
const User = require("../models/User.js");

const generateOtp = async (req, res) => {
    const { email } = req.body;
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false }); 
    try {
        await OTP.create({ email, otp });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'OTP Verification for food waste reduction platform',
            text: `Your 6 digit OTP for verification is: ${otp}. it is valid for 5 minute`
        });
        res.status(200).json({
            "message":"OTP sent successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            "message":"Error sending OTP",
            "error": error
        });
    } 
}



const verifyOtp = async (req, res) => {
    const {email, otp} = req.body;
    // console.log(req.body); 
    try {
        const otpRecord = await OTP.findOne({ email, otp }).exec();
        const token = generateToken(email); 
        // console.log(otpRecord);
        // console.log(token); 
        if (otpRecord) {
            res.status(200).json({
                "message":"OTP verified successfully",
                "token": token
            });
        } else {
            res.status(400).json({
                "message":"Invalid OTP"
            });
        }
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({
            "message":"Error verifying OTP",
            "error": error
        });
    }
}; 


const resetPassword = async (req, res) => {

    const {email, password} = req.body; 
    // console.log(email); 
    if(!password){
        return res.json({
            "message": "password is missing"
        })
    }
    if(!email){
        return res.json({
            "message": "email is missing"
        })
    }
    try{    
        const newPassword = await plainToHashPassword(password); 
        const result = await User.updateOne({ email: email}, { $set: { password: newPassword } });
    }
    catch(err){
        return res.json({
            "message": "Error in reset password",
            "error": err
        })
    }
    return res.status(200).json({
        "message": "passsword reset succesfully"
    })
};

module.exports = {generateOtp, verifyOtp, resetPassword}; 