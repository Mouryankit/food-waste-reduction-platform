const express = require("express");
const app = express();
require('dotenv').config();

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
const { AddDonation, myDonation, getDonationDetail, updateDonationDetail, deleteDonation } = require("./controllers/restaurant.js");
app.post("/restaurant", AddDonation);   //restaurant can create donation for it 
app.get("/restaurant", myDonation)      // when user click in mydonation
app.get("/restaurant/donation/:id", getDonationDetail);    //get donation by id
app.patch("/restaurant/donation/:id", updateDonationDetail); 
app.delete("/restaurant/:id", deleteDonation);   //delete a donation


// ngo dashboard

const { getAllDonation, getAcceptedDonation, acceptDonation, deliverDonation, getDeliveredDonation } = require("./controllers/ngo.js");

app.get("/ngo", getAllDonation); // get all the donation for ngo
app.get("/ngo/accepted-donation", getAcceptedDonation)  //get all donation accepted by ngo  
app.post("/ngo/accept-donation", acceptDonation);  // accept donation
app.post("/ngo/deliver-donation", deliverDonation);  //ngo confirm delivery donation is succesefully delivered 
app.get("/ngo/delivered-donation", getDeliveredDonation); //get all the delivered donation for a user 



// admin routes 
const { getAllUsers, blockUser, unblockUser, getUser, updateUser } = require("./controllers/admin.js");

// user management
app.get("/admin/users", getAllUsers);
app.patch("/admin/block-user/:id", blockUser);
app.patch("/admin/unblock-user/:id", unblockUser);
app.get("/admin/user/:id", getUser);
app.put("/admin/user/:id", updateUser);


const { getAllDonations, updateDonationStatus, getDonation, updateDonation } = require("./controllers/admin.js");
// donation management
app.get("/admin/donations", getAllDonations);
app.patch("/admin/donation-status/:id", updateDonationStatus);
app.get("/admin/donation/:id", getDonation);
app.patch("/admin/donation/:id", updateDonation);

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

