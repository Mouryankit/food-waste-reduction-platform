const mongoose = require('mongoose');

const mongodbUrl = process.env.MONGODB_URL;
async function connectDb() {
    try{
        await mongoose.connect(mongodbUrl);
        console.log("database connect succesefully");
    }
    catch(err){
        console.log("database connection failed");
        console.log(err); 
    }
}

module.exports = connectDb; 