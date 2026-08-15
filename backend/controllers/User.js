const bcrypt = require('bcrypt');
const User = require("../models/User.js");
const jwt = require('jsonwebtoken');
const plainToHashPassword = require("../utils/hash.js");

const signup = async (req, res) => {

    const { username, email, password, role, location } = req.body;
    if (!username || !email || !password || !role || !location) {
        return res.status(401).json({
            "message": "data is missing"
        })
    }
    const hashedPassword = await plainToHashPassword(password);

    try {
        const validUser = new User({
            name: username,
            email: email,
            password: hashedPassword,
            role: role,
            location: location
        });

        const savedUser = await validUser.save();

        return res.status(201).json({ "message": "Signup sucessfull" });
    }
    catch (err) {
        return res.status(400).json({ "message": "user already exist", "error": err });
    }
}
const login = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            message: "Email, password and role are required"
        });
    }

    try {
        const user = await User.findOne({ email });

        // Don't reveal whether the email exists
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check if account is currently locked
        if (
            user.loginLockedUntil &&
            new Date() < user.loginLockedUntil
        ) {
            const remainingMs =
                user.loginLockedUntil.getTime() - Date.now();

            const remainingMinutes = Math.ceil(
                remainingMs / (60 * 1000)
            );

            return res.status(429).json({
                message: `Too many failed login attempts. Try again in ${remainingMinutes} minutes.`
            });
        }

        // If the lock has expired
        if (
            user.loginLockedUntil &&
            new Date() >= user.loginLockedUntil
        ) {
            user.loginLockedUntil = null;
            user.failedLoginAttempts = 0;

            await user.save();
        }

        // Check password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        // Check password AND role
        if (!isMatch || user.role !== role) {

            user.failedLoginAttempts += 1;

            // 3 failed attempts
            if (user.failedLoginAttempts >= 3) {

                // 30 minutes × 2^lockLevel
                const lockDuration =
                    30 * 60 * 1000 *
                    Math.pow(2, user.loginLockLevel);

                user.loginLockedUntil =
                    new Date(Date.now() + lockDuration);

                // Increase level for next lock
                user.loginLockLevel += 1;

                // Reset attempt counter
                user.failedLoginAttempts = 0;

                await user.save();

                const lockMinutes =
                    lockDuration / (60 * 1000);

                return res.status(429).json({
                    message: `Too many failed attempts. Account locked for ${lockMinutes} minutes.`
                });
            }

            await user.save();

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Successful login
        user.failedLoginAttempts = 0;
        user.loginLockLevel = 0;
        user.loginLockedUntil = null;

        await user.save();

        // Create JWT
        const secretKey = process.env.JWT_SECRET;

        const payload = {
            id: user._id,
            role: user.role,
            location: user.location
        };

        const token = jwt.sign(
            payload,
            secretKey,
            {
                expiresIn: "1d"
            }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful"
        });

    } catch (err) {
        console.error("Login error:", err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const logout = (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({
        message: "Logout successful"
    });
};

module.exports = { signup, login, logout };

