const express = require("express");
const app = express();
app.disable("x-powered-by");
require('dotenv').config();

const logger = require("./utils/logger");

// Request logging middleware to measure response times
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            responseTimeMs: duration
        };
        logger.info(JSON.stringify(logData));
    });
    next();
});

// api rate limit
const { limiter } = require("./middleware/rateLimit.js"); 
app.use(limiter);

// parsing the data 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies 
const cookieParser = require("cookie-parser");
app.use(cookieParser());

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
    return res.json({ "message": "data recieved" });
});

app.use((req, res, next) => {
    const error = new Error("Page not found");
    error.statusCode = 404;
    next(error); // Pass 404 error to the global handler below
});

app.use((err, req, res, next) => {
    // Determine status code (default to 500 Internal Server Error)
    const statusCode = err.statusCode || err.status || 500;
    
    // Define user-friendly error message
    const message = err.message || "An unexpected error occurred on the server.";

    // Log the error internally with its full stack trace
    logger.error(err);

    // Send structured JSON to client
    return res.status(statusCode).json({
        success: false,
        message: message,
        // Optional: Include stack trace ONLY in development mode for security
        ...(process.env.NODE_ENV === "development" && { 
            stack: err.stack,
            details: err 
        })
    });
});

module.exports = app;
