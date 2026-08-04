
const Donation = require("../models/donationSchema.js");

const AddDonation = async (req, res) => {
    // console.log(req.body); 
    const { foodName, quantity, unit, description, phone, pickupAddress, expiryDate } = req.body;
    if (!foodName || !quantity || !unit || !description || !phone || !pickupAddress || !expiryDate) {
        return res.json({
            "message": "Data is missing"
        })
    }
    const { user } = req;
    if (user.role === "restaurant") {
        // console.log(user); 
        const deliveryStatus = "pending";
        const valid = true;
        const data = { foodName, quantity, unit, description, phone, pickupAddress, deliveryStatus, valid, expiryDate, userObjectId: user.id };

        // console.log(data); 
        const newDonation = new Donation(data);
        try {
            const result = await newDonation.save();
        }
        catch (err) {
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

// const Donation = require("./models/donationSchema.js"); 
const myDonation = async (req, res) => {   //when user click my donation
    try {
        const { id } = req.user;
        const result = await Donation.find({ userObjectId: id });
        return res.json({
            "message": "Data send Succesefully",
            "result": result
        })
    }
    catch (err) {
        return res.json({
            "message": "some error occurs",
            "error": err
        })
    }
}

const getDonationDetail = async (req, res) => {
    console.log("working");
    try {
        const { id: donationId } = req.params;

        console.log(donationId);
        const result = await Donation.findById(donationId).populate("ngoObjectId");
        return res.json({
            "message": "Data send Succesefully",
            "data": result
        })
    }
    catch (err) {
        return res.json({
            "message": "some error occurs",
            "error": err
        })
    }
};

const updateDonationDetail = async (req, res) => {
    // console.log(req.body); 
    const { foodName, quantity, unit, description, phone, pickupAddress, expiryDate } = req.body;
    if (!foodName || !quantity || !unit || !description || !phone || !pickupAddress || !expiryDate) {
        return res.json({
            "message": "Data is missing"
        })
    }
    const { user } = req;
    const {id: donationId} = req.params; 
    if (user.role === "restaurant") {
        const data = { foodName, quantity, unit, description, phone, pickupAddress, expiryDate };

        try {
            const updatedDonation = await Donation.findOneAndUpdate(
                {
                    _id: donationId
                },
                data,
                {
                    new: true,
                    runValidators: true
                }
            );
            console.log(updatedDonation); 
        }
        catch (err) {
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
        "message": "Donation updated succesefully"
    })
}

module.exports = { AddDonation, myDonation, getDonationDetail, updateDonationDetail }; 