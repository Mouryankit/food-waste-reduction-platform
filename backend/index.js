const express = require("express");
const app = express();
app.set("trust proxy", 1);
require('dotenv').config();

// api rate limit
// const apiRateLimit = require("./middleware/apiRateLimit.js"); 
// app.use(apiRateLimit);

const {checkBlockedUser, apiRateLimit} = require("./middleware/rateLimit.js");
app.use(checkBlockedUser);
app.use(apiRateLimit);

const connectDb = require("./config/db.js");
connectDb();

// parsing the data 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies 
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// cors enabling 
// const cors = require('cors');
// app.use(cors());

// Configuration for Production
// cors enabling 
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Fallback to local Vite server in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed HTTP actions
  allowedHeaders: ['Content-Type', 'Authorization']   // Allowed Headers
};

app.use(cors(corsOptions));

const Donation = require("./models/donationSchema.js");
const User = require("./models/User.js");

app.get("/", (req, res) => {
    return res.json({
        "message": "Api Working"
    })
});

const authMiddleware = require("./middleware/authMiddleware.js"); 
app.get("/auth/me", authMiddleware, (req, res) => {
    res.json({
        user: req.user
    });
});

// authentication routes 
const { signup, login, logout } = require("./controllers/User.js");
app.post("/auth/signup", signup);
app.post("/auth/login", login);
app.post("/auth/logout", logout);

// password reset routes
const checkEmailExist = require("./middleware/checkEmailExist.js");
const verifyPasswordResetToken = require("./middleware/verifyPasswordResetToken.js");
const { generateOtp, verifyOtp, resetPassword } = require("./controllers/passwordReset.js");

app.post("/auth/generate-otp", checkEmailExist, generateOtp);
app.post("/auth/verify-otp", checkEmailExist, verifyOtp);
app.post("/auth/reset-password", verifyPasswordResetToken, resetPassword);

// restaurant dashboard routes 
const verifyToken = require("./middleware/verifyToken.js");
const verifyUser = require("./middleware/verifyUser.js");
app.use(verifyToken);
app.use(verifyUser); 

const {checkAdmin, checkNgo, checkRestaurant} = require("./middleware/checkUserRoles.js"); 


const { AddDonation, myDonation, getDonationDetail, updateDonationDetail, deleteDonation } = require("./controllers/restaurant.js");
app.post("/restaurant", checkRestaurant, AddDonation);   //restaurant can create donation for it 
app.get("/restaurant", checkRestaurant, myDonation)      // when user click in mydonation
app.get("/restaurant/donation/:id", checkRestaurant, getDonationDetail);    //get donation by id
app.patch("/restaurant/donation/:id", checkRestaurant, updateDonationDetail); 
app.delete("/restaurant/:id", checkRestaurant, deleteDonation);   //delete a donation


// ngo dashboard

const { getAllDonation, getAcceptedDonation, acceptDonation, deliverDonation, getDeliveredDonation } = require("./controllers/ngo.js");

app.get("/ngo", checkNgo, getAllDonation); // get all the donation for ngo
app.get("/ngo/accepted-donation", checkNgo, getAcceptedDonation)  //get all donation accepted by ngo  
app.post("/ngo/accept-donation", checkNgo, acceptDonation);  // accept donation
app.post("/ngo/deliver-donation", checkNgo, deliverDonation);  //ngo confirm delivery donation is succesefully delivered 
app.get("/ngo/delivered-donation", checkNgo, getDeliveredDonation); //get all the delivered donation for a user 



// admin routes 
const { getAllUsers, blockUser, unblockUser, getUser, updateUser } = require("./controllers/admin.js");


// app.use(checkAdmin); 

// user management
app.get("/admin/users", checkAdmin, getAllUsers);
app.patch("/admin/block-user/:id", checkAdmin, blockUser);
app.patch("/admin/unblock-user/:id", checkAdmin, unblockUser);
app.get("/admin/user/:id", checkAdmin, getUser);
app.put("/admin/user/:id", checkAdmin, updateUser);


const { getAllDonations, updateDonationStatus, getDonation, updateDonation } = require("./controllers/admin.js");
// donation management
app.get("/admin/donations", checkAdmin, getAllDonations);
app.patch("/admin/donation-status/:id", checkAdmin, updateDonationStatus);
app.get("/admin/donation/:id", checkAdmin, getDonation);
app.patch("/admin/donation/:id", checkAdmin, updateDonation);

const {getAnalytics} = require("./controllers/analytics.js"); 
app.get("/admin/analytics", getAnalytics);

app.post("/test", async (req, res) => {
    // console.log(req.body);
    // console.log("working");
    return res.json({ "message": "data recieved" });
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

