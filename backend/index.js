const express = require("express"); 
const app = express(); 
require('dotenv').config();

const port = process.env.PORT; 


app.get("/", (req, res)=> {
    res.send("Api Working")
})

app.use((req, res) => {
    res.status(400)
        .json({
            message: "page not found"
        })
})

app.listen(port, () => {
    console.log(`server is runnig on port ${port}`); 
})  

