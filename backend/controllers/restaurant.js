const Donation = require("../models/donationSchema.js");
const User = require("../models/User.js");
const { sendEmail } = require("../utils/emailHelper.js");

const AddDonation = async (req, res) => {
    // console.log(req.body); 
    const { foodName, quantity, unit, description, phone, pickupAddress, pickupLocation, expiryDate, notifyNgos } = req.body;
    if (!foodName || !quantity || !unit || !description || !phone || !pickupAddress || !pickupLocation || !expiryDate) {
        return res.json({
            "message": "Data is missing"
        })
    }

    const { user } = req;
    if (user.role === "restaurant") {
        // console.log(user); 
        const deliveryStatus = "pending";
        const data = { foodName, quantity, unit, description, phone, pickupAddress, pickupLocation, deliveryStatus, expiryDate, userObjectId: user.id };

        // console.log(data); 
        const newDonation = new Donation(data);
        try {
            const result = await newDonation.save();
            
            // Asynchronously notify all active NGOs if requested by the restaurant
            if (notifyNgos === true || notifyNgos === 'true') {
                sendNgoNotification(user.id, result).catch(err => console.error("Notification failed: ", err));
            }
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
        const result = await Donation.find({ userObjectId: id }).populate("ngoObjectId", "name");
        // console.log(result); 
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
    // console.log("working");
    try {
        const { id: donationId } = req.params;

        // console.log(donationId);
        const result = await Donation.findById(donationId).populate("ngoObjectId", "-password");
        // console.log(result); 
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
    const { foodName, quantity, unit, description, phone, pickupAddress, pickupLocation, expiryDate } = req.body;
    if (!foodName || !quantity || !unit || !description || !phone || !pickupAddress || !pickupLocation || !expiryDate) {
        return res.json({
            "message": "Data is missing"
        })
    }

    const { user } = req;
    const {id: donationId} = req.params; 
    if (user.role === "restaurant") {
        const data = { foodName, quantity, unit, description, phone, pickupAddress, pickupLocation, expiryDate };
        
        // console.log(data); 
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
            // console.log(updatedDonation); 
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

const deleteDonation = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id);

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }

        if (donation.userObjectId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        await Donation.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Donation deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const sendNgoNotification = async (restaurantId, donation) => {
    try {
        // 1. Fetch restaurant user details
        const restaurant = await User.findById(restaurantId);
        const restaurantName = restaurant ? restaurant.name : "A restaurant";

        // 2. Fetch all users with role 'ngo'
        const ngos = await User.find({ role: "ngo", valid: true }, "email");
        const ngoEmails = ngos.map(ngo => ngo.email);

        if (ngoEmails.length === 0) {
            console.log("No active NGOs found to notify.");
            return;
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const expiryDateStr = new Date(donation.expiryDate).toLocaleString();

        // 3. Compose visually stunning HTML content
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #10B981, #059669);
      color: #ffffff;
      padding: 35px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 30px;
    }
    .welcome {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .food-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .food-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .detail-row {
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.4;
    }
    .detail-label {
      font-weight: 600;
      color: #4b5563;
      display: inline-block;
      width: 120px;
    }
    .detail-value {
      color: #111827;
    }
    .description-box {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0 10px;
    }
    .btn {
      display: inline-block;
      background-color: #10B981;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }
    .footer {
      background-color: #f9fafb;
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Food Donation Available!</h1>
    </div>
    <div class="content">
      <p class="welcome">Hello NGO Team,</p>
      <p class="welcome">A new food donation has been listed on the <strong>Food Waste Reduction Platform</strong>. Please review the details below:</p>
      
      <div class="food-card">
        <div class="food-title">${donation.foodName}</div>
        <div class="detail-row">
          <span class="detail-label">Quantity:</span>
          <span class="detail-value">${donation.quantity} ${donation.unit}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Restaurant:</span>
          <span class="detail-value">${restaurantName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Address:</span>
          <span class="detail-value">${donation.pickupAddress}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Expiry Date:</span>
          <span class="detail-value">${expiryDateStr}</span>
        </div>
        <div class="detail-row description-box">
          <span class="detail-label" style="display:block; margin-bottom: 4px;">Description:</span>
          <span class="detail-value" style="display:block; font-style: italic;">"${donation.description}"</span>
        </div>
      </div>
      
      <div class="btn-container">
        <a href="${frontendUrl}" class="btn">View & Claim Donation</a>
      </div>
    </div>
    <div class="footer">
      <p>You received this email because you are registered as an NGO on our platform.</p>
      <p>&copy; ${new Date().getFullYear()} Food Waste Reduction Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `;

        // 4. Send emails in batches of 100 using BCC to respect SMTP limits and preserve privacy
        const BATCH_SIZE = 100;
        for (let i = 0; i < ngoEmails.length; i += BATCH_SIZE) {
            const batch = ngoEmails.slice(i, i + BATCH_SIZE);
            await sendEmail({
                bcc: batch,
                subject: `[New Donation] ${donation.quantity} ${donation.unit} of ${donation.foodName} available`,
                text: `A new food donation is available: ${donation.foodName} (${donation.quantity} ${donation.unit}) from ${restaurantName}. Pickup address: ${donation.pickupAddress}. Expiry Date: ${expiryDateStr}. Log in to view details: ${frontendUrl}`,
                html: htmlContent
            });
        }
        
        console.log(`Notification sent to ${ngoEmails.length} NGOs.`);
    } catch (error) {
        console.error("Error in notifying NGOs: ", error);
    }
};

module.exports = { AddDonation, myDonation, getDonationDetail, updateDonationDetail, deleteDonation }; 