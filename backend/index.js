const express = require("express"); 
const app = express(); 
require('dotenv').config();

const connectDb = require("./config/db.js");
connectDb(); 

// parsing the data 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors enabling 
const cors = require('cors');
app.use(cors());

// Configuration for Production
// const corsOptions = {
//   origin: process.env.FRONTEND_URL, // Allow only this domain
// //   methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP actions
// //   allowedHeaders: ['Content-Type', 'Authorization'] 
// };

// app.use(cors(corsOptions)); 




app.get("/", (req, res)=> {
    return res.json({
        "message": "Api Working"
    })
});

// authentication routes 
const {signup, login} = require("./controllers/User.js"); 
app.post("/auth/signup", signup); 
app.post("/auth/login", login); 

// password reset routes
const checkEmailExist = require("./middleware/checkEmailExist.js");
const verifyPasswordResetToken = require("./middleware/verifyPasswordResetToken.js"); 
const {generateOtp, verifyOtp, resetPassword} = require("./controllers/passwordReset.js");

app.post("/auth/generate-otp", checkEmailExist, generateOtp);  
app.post("/auth/verify-otp", checkEmailExist, verifyOtp); 
app.post("/auth/reset-password", verifyPasswordResetToken, resetPassword);

// restaurant dashboard routes 
const verifyToken = require("./middleware/verifyToken.js");
app.use(verifyToken); 
const AddDonation = require("./controllers/restaurant.js");
app.post("/restaurant", AddDonation); 
app.get("/restaurant",(req, res)=>{
    return res.json({
        "message":"working"
    })
})

app.post("/test", (req, res) => {
    console.log(req.body); 
    console.log("working"); 
    return res.json({"message":"data recieved"}); 
}); 



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

