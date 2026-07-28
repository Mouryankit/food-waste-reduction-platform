
const Donation = require("../models/donationSchema.js"); 

const AddDonation = async (req, res) => {
    // console.log(req.body); 
    const {foodname: foodName, quantity, unit, description, phone, pickupAddress} = req.body; 
    if(!foodName || !quantity || !unit || !description || !phone || !pickupAddress){
        return res.json({
            "message": "Data is missing"
        })
    }
    const {user} = req;  
    if(user.role === "restaurant"){
        // console.log(user); 
        const deliveryStatus = "pending"; 
        const valid = true; 
        const data = {foodName, quantity, unit, description, phone, pickupAddress, deliveryStatus, valid, userObjectId: user.id}; 

        // console.log(data); 
        const newDonation = new Donation(data);
        try{
            const result = await newDonation.save();
        }
        catch(err){
            return res.status(401).json({
                "message": "Error in saving data",
                "error": err
            });
        }
    }
    else {
        return res.json({
            "message": "you are not autherized to add donations"
        })
    }
    return res.json({
        "message": "Donation Added succesefully"
    })
};

module.exports = AddDonation; 