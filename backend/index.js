const express = require("express"); 
const app = express(); 
require('dotenv').config();

const connectDb = require("./config/db.js");
connectDb(); 

// parsing the data 
app.use(express.json());

// cors enabling 
const cors = require('cors');

// Secure Configuration for Production
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
app.post("/auth/signup", signup); 
app.post("/auth/login", login); 

app.post("/test", (req, res) => {
    console.log(req.body); 
    console.log("working"); 
    return res.json({"message":"data recieved"}); 
}); 

// const end = (req, res) => {
//     return res.json({
//         "message": "token verified"
//     })
// }; 
// const verifyToken = require("./middleware/verifyToken.js");
// app.get("/auth/verify", verifyToken, end); 


app.use((err, req, res, next) => {
    return res.status(291).json({
        "message": "some error occure"
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

