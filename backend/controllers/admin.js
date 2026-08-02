
const getAllDonations =  async (req, res) => {
    if (req.user.role !== "admin") {
        return res.json({
            "message": "you are not autherized to access",
        })
    };
    try {
        const result = await Donation.find({});
        return res.send({
            "message": "data recieved",
            "data": result
        })
    }
    catch (err) {
        return res.json({
            "message": "some error occured",
            "error": err
        })
    }
};


const blockDonation = async (req, res) => {
    return res.json({
        "message": "working"
    })
}

const getAllUsers = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.json({
            "message": "you are not autherized to access",
        })
    };
    try {
        const result = await User.find({});
        return res.send({
            "message": "data recieved",
            "data": result
        })
    }
    catch (err) {
        return res.json({
            "message": "some error occured",
            "error": err
        })
    }
};

const blockUser = async (req, res) => {
    return res.json({
        "message": "working"
    })
}


module.exports = {getAllDonations, blockDonation, getAllUsers, blockUser}; 