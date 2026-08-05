// user management 

const User = require("../models/User");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                valid: false
            },
            {
                new: true
            }
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User blocked successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                valid: true
            },
            {
                new: true
            }
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User unblocked successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                role
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user

        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// donation management

const Donation = require("../models/donationSchema");
const getAllDonations = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) {
            filter.deliveryStatus = status;
        }

        const donations = await Donation.find(filter)
            .populate("userObjectId", "name email")
            .populate("ngoObjectId", "name email");

        return res.status(200).json({
            success: true,
            donations
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateDonationStatus = async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            {
                deliveryStatus: req.body.deliveryStatus
            },
            {
                new: true
            }
        );
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Donation updated"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getDonation = async (req, res) => {

    try {

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }

        return res.status(200).json({
            success: true,
            donation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
const updateDonation = async (req, res) => {

    try {

        const donation = await Donation.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        if (!donation) {

            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });

        }

        return res.status(200).json({
            success: true,
            message: "Donation updated successfully",
            donation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = { getAllUsers, blockUser, unblockUser, getUser, updateUser, getAllDonations, updateDonationStatus, getDonation, updateDonation }; 