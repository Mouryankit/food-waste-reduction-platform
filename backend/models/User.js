const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Field is mandatory
    email: { type: String, required: true, unique: true }, // Must be unique in DB
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["restaurant", "ngo", "admin"] },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    valid: { type: Boolean, default: true },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    loginLockLevel: {
        type: Number,
        default: 0
    },
    loginLockedUntil: {
        type: Date,
        default: null
    },
    createdAt: { type: Date, default: Date.now } // Automatically defaults to today
});

const User = mongoose.model('User', userSchema);

module.exports = User; 