const Donation = require("../models/donationSchema.js");

const getAllDonation = async (req, res) => {
    try {
        const data = await Donation.find({ deliveryStatus: "pending" });
        // console.log(data); 
        return res.send({
            "message": "data sent succesefully",
            "result": data
        });
    }
    catch (err) {
        return res.send({
            "message": "some error occured",
            "error": err
        });
    }
}

const getAcceptedDonation = async (req, res) => { //need working
    // console.log("working"); 
    const id = req.user.id;
    // console.log(id); 
    try {
        const result = await Donation.find({ ngoObjectId: id, deliveryStatus: "accepted" });
        return res.json({
            "message": "data sent succesefully",
            "result": result
        })
    }
    catch (err) {
        return res.json({
            "message": "some error occur",
            "error": err
        })
    }
}

const acceptDonation = async (req, res) => {
    if (req.user.role !== "ngo") {
        return res.json({
            "message": "you are not autherized to accept donation"
        })
    }
    // console.log(req.user)
    const { donationId } = req.body;
    try {
        const result1 = await Donation.findOne({ _id: donationId, deliveryStatus: "pending"});
        if (!result1) {
            return res.json({
                "message": "Donation not exist",
            })
        }
        const result2 = await Donation.updateOne({ _id: donationId }, { $set: { ngoObjectId: req.user.id, deliveryStatus: "accepted" } });
        if (result2) {
            return res.status(200).json({
                "message": "Donation Accepted succesefully",
            })
        }
    }
    catch (err) {
        return res.json({
            "message": "Some error occure",
            "error": err
        })
    }
};

const deliverDonation = async (req, res) => {
    // console.log("working"); 
    const { donationId } = req.body;
    try {
        const result1 = await Donation.findOne({ _id: donationId, deliveryStatus: "accepted" });
        if (!result1) {
            return res.json({
                "message": "Donation not exist",
            })
        }
        // console.log(result1); 
        const result2 = await Donation.updateOne({ _id: donationId }, { $set: { deliveryStatus: "delivered" } });
        if (result2) {
            return res.status(200).json({
                "message": "Donation delivered succesefully",
            })
        }
    }
    catch (err) {
        return res.json({
            "message": "Failed to update status",
            "error": err
        })
    }
};

const getDeliveredDonation = async (req, res) => {
    // console.log("working"); 
    const id = req.user.id;
    // // console.log(id); 
    try {
        const result = await Donation.find({ ngoObjectId: id, deliveryStatus: "delivered" });
        if(!result){
            return res.json({
                "message": "No Delivered Donations",
            })
        } 
        // console.log(result); 
        return res.json({
            "message": "data sent succesefully",
            "result": result
        })
    }
    catch (err) {
        return res.json({
            "message": "some error occur",
            "error": err
        })
    }
};

module.exports = { acceptDonation, getAllDonation, getAcceptedDonation, deliverDonation, getDeliveredDonation };