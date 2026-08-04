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


const Donation = require("./models/donationSchema.js");
const User = require("./models/User.js");

app.get("/", (req, res) => {
    return res.json({
        "message": "Api Working"
    })
});

// authentication routes 
const { signup, login } = require("./controllers/User.js");
app.post("/auth/signup", signup);
app.post("/auth/login", login);

// password reset routes
const checkEmailExist = require("./middleware/checkEmailExist.js");
const verifyPasswordResetToken = require("./middleware/verifyPasswordResetToken.js");
const { generateOtp, verifyOtp, resetPassword } = require("./controllers/passwordReset.js");

app.post("/auth/generate-otp", checkEmailExist, generateOtp);
app.post("/auth/verify-otp", checkEmailExist, verifyOtp);
app.post("/auth/reset-password", verifyPasswordResetToken, resetPassword);

// restaurant dashboard routes 
const verifyToken = require("./middleware/verifyToken.js");
app.use(verifyToken);
const { AddDonation, myDonation, getDonationDetail, updateDonationDetail } = require("./controllers/restaurant.js");
app.post("/restaurant", AddDonation);   //restaurant can create donation for it 
app.get("/restaurant", myDonation)      // when user click in mydonation
app.get("/restaurant/donation/:id", getDonationDetail);    //get donation by id
app.patch("/restaurant/donation/:id", updateDonationDetail); 
// app.delete("/restaurant/:id"); 


// ngo dashboard

const { getAllDonation, getAcceptedDonation, acceptDonation, deliverDonation, getDeliveredDonation } = require("./controllers/ngo.js");

app.get("/ngo", getAllDonation); // get all the donation for ngo
app.get("/ngo/accepted-donation", getAcceptedDonation)  //get all donation accepted by ngo  
app.post("/ngo/accept-donation", acceptDonation);  // accept donation
app.post("/ngo/deliver-donation", deliverDonation);  //ngo confirm delivery donation is succesefully delivered 
app.get("/ngo/delivered-donation", getDeliveredDonation); //get all the delivered donation for a user 



// admin routes 
const { getAllDonations, blockDonation, getAllUsers, blockUser } = require("./controllers/admin.js");
app.get("/admin/donations", getAllDonations);
app.post("/admin/doation/block", blockDonation);
app.get("/admin/users", getAllUsers);
app.post("/admin/user/block", blockUser);




app.post("/test", async (req, res) => {
    console.log(req.body);
    console.log("working");
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

