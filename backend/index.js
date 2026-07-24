const express = require("express"); 
const app = express(); 
require('dotenv').config();

const connectDb = require("./config/db.js");
connectDb(); 

// parsing the data 
app.use(express.json());

// cors enabling 
const cors = require('cors');

// Configuration for Production
// const corsOptions = {
//   origin: process.env.FRONTEND_URL, // Allow only this domain
// //   methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP actions
// //   allowedHeaders: ['Content-Type', 'Authorization'] 
// };

// app.use(cors(corsOptions)); 
app.use(cors())





app.get("/", (req, res)=> {
    return res.json({
        "message": "Api Working"
    })
});


const {signup, login} = require("./controllers/User.js"); 
const { updateOne } = require("./models/User.js");
app.post("/auth/signup", signup); 
app.post("/auth/login", login); 

app.post("/test", (req, res) => {
    console.log(req.body); 
    console.log("working"); 
    return res.json({"message":"data recieved"}); 
}); 

const User = require("./models/User.js");

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
        return res.json({
            "message": "user with this email does not exist"
        });
    }
}

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose'); 

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: { type: Date, expires: '5m', default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

app.post("/auth/generate-otp", checkEmailExist, async (req, res) => {
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
}); 


const jwt = require("jsonwebtoken"); 
const generateToken = (email) => {
    const secretKey = process.env.JWT_SECRET;

    // Manually build a safe payload object
    const payload = { 
        email: email,
        allowPasswordReset: true // Hardcode the specific permission scope
    }; 

    // Sign the token with a short expiration time (e.g., 15 minutes)
    const token = jwt.sign(payload, secretKey, {
        expiresIn: '10m' 
    });
    return token; 
}

// Verify OTP
app.post('/auth/verify-otp', async (req, res) => {
    const {email, otp} = req.body;
    console.log(req.body); 
    try {
        const otpRecord = await OTP.findOne({ email, otp }).exec();
        const token = generateToken(email); 
        console.log(otpRecord);
        console.log(token); 
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
});

const verifyPasswordResetToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token
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

// const User = require("./models/User.js");
const plainToHashPassword = require("./utils/hash.js");
app.post("/auth/reset-password", verifyPasswordResetToken, async (req, res) => {

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
})




app.use((err, req, res, next) => {
    return res.json({
        "message": "some error occure",
        "error": err
    });
})


app.use((req, res) => {
    return res.status(404)
        .json({
            message: "page not found"
        })
})

const port = process.env.PORT; 
app.listen(port, () => {
    console.log(`server is runnig on port ${port}`); 
})  

