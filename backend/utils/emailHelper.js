const nodemailer = require("nodemailer");

// Create transport based on env configurations
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_PORT ? process.env.SMTP_PORT === "465" : true, // true for 465, false for other ports (like 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// /**
//  * Reusable helper to send emails
//  * @param {Object} options
//  * @param {string} [options.to] - Primary recipient
//  * @param {string[]} [options.bcc] - Array of BCC recipient emails
//  * @param {string} options.subject - Email subject line
//  * @param {string} [options.text] - Plain text body
//  * @param {string} [options.html] - HTML body
//  */

const sendEmail = async ({ to, bcc, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      subject,
      text,
      html,
    };
    if (to) mailOptions.to = to;
    if (bcc && bcc.length > 0) mailOptions.bcc = bcc.join(",");

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);
    // console.log(info); 
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = { sendEmail };
