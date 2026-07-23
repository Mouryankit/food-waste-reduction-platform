const mongoose = require("mongoose"); 

const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Field is mandatory
    email: { type: String, required: true, unique: true }, // Must be unique in DB
    password: {type: String, required: true},
    role: {type: String, required: true, enum: ["restaurant", "ngo", "admin"]},
    createdAt: { type: Date, default: Date.now } // Automatically defaults to today
});

const User = mongoose.model('User', userSchema);

module.exports = User; 