const Donation = require("../models/donationSchema");
const User = require("../models/User");

const getAnalytics = async (req, res) => {

    try {

        const totalUsers = await User.countDocuments();

        const totalRestaurants = await User.countDocuments({
            role: "restaurant"
        });

        const totalNGOs = await User.countDocuments({
            role: "ngo"
        });

        const totalDonations = await Donation.countDocuments();

        const pending = await Donation.countDocuments({
            deliveryStatus: "pending"
        });

        const accepted = await Donation.countDocuments({
            deliveryStatus: "accepted"
        });

        const delivered = await Donation.countDocuments({
            deliveryStatus: "delivered"
        });

        const cancelled = await Donation.countDocuments({
            deliveryStatus: "cancelled"
        });

        const today = new Date();
        today.setHours(0,0,0,0);

        const dailyDonations = await Donation.countDocuments({
            createdAt:{
                $gte: today
            }
        });

        const week = new Date();
        week.setDate(week.getDate()-7);

        const weeklyDonations = await Donation.countDocuments({
            createdAt:{
                $gte: week
            }
        });

        const month = new Date();
        month.setMonth(month.getMonth()-1);

        const monthlyDonations = await Donation.countDocuments({
            createdAt:{
                $gte: month
            }
        });

        return res.status(200).json({

            success:true,

            analytics:{
                totalUsers,
                totalRestaurants,
                totalNGOs,
                totalDonations,
                pending,
                accepted,
                delivered,
                cancelled,
                dailyDonations,
                weeklyDonations,
                monthlyDonations
            }

        });

    } catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

module.exports = {
    getAnalytics
};