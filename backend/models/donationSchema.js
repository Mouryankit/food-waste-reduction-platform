const mongoose = require('mongoose'); 
const { Schema } = mongoose;

const donationSchema = new mongoose.Schema({
    foodName: {type:String, required: true},
    quantity: {type:Number, min: [1, "Quantity cannot be less than 1"], required: true},
    unit: {type:String, enum: ["kg", "g", "lbs", "servings", "boxes", "items"], required: true},
    description: {type:String, required: true},
    phone: {type:String, match: [/^\d{10}$/, "Phone number must be between 10 digits, without spaces or dashes"], required: true},
    pickupAddress: {type:String, required: true},
    deliveryStatus: {type:String, default:"pending", enum: ["pending", "accepted", "delivered", "cancelled"], required: true},
    valid: {type: Boolean, default: true, required: true},
    userObjectId: {type: Schema.Types.ObjectId, ref: 'User', required: true },
    ngoObjectId: {type: Schema.Types.ObjectId, ref: "User"},
    createdAt: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation; 

 