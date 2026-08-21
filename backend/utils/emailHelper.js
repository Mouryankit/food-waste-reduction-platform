const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = null;

/**
 * Lazy initializer for Nodemailer transporter
 */
const getTransporter = () => {
    if (!transporter) {
        const host = process.env.SMTP_HOST || "smtp.gmail.com";
        const port = Number.parseInt(process.env.SMTP_PORT || "465");
        const secure = process.env.SMTP_PORT ? process.env.SMTP_PORT === "465" : true;

        transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
};

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
        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
        
        if (!fromAddress) {
            throw new Error("SMTP sender address (SMTP_FROM or SMTP_USER) is not configured in environment variables.");
        }

        // Brevo requires a verified sender address. Using the Brevo SMTP username as the sender will fail.
        if (fromAddress.includes("@smtp-brevo.com") && !process.env.SMTP_FROM) {
            console.warn(
                "Warning: SMTP_FROM is not defined. Brevo will likely reject emails sent with SMTP_USER username (e.g. b51b7c001@smtp-brevo.com) as the sender."
            );
        }

        const mailOptions = {
            from: fromAddress,
            subject,
            text,
            html,
        };
        if (to) mailOptions.to = to;
        if (bcc && bcc.length > 0) mailOptions.bcc = bcc.join(",");

        const activeTransporter = getTransporter();
        const info = await activeTransporter.sendMail(mailOptions);
        console.log("Email sent successfully: ", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};

module.exports = { sendEmail };

