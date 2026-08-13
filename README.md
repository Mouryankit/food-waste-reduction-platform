# Food Waste Reduction Platform

A modern, professional food-tech and sustainability web application designed to connect surplus food from restaurants and donors with local NGOs and community distribution centers.

---

## Key Features

- **Role-Based Portals**: Custom user flows for **Restaurants** (donors), **NGOs** (receivers), and **Admins** (moderators).
- **Surplus Listings**: Restaurants can quickly list surplus food items, quantities, and expiration dates.
- **Interactive Proximity Map**: NGOs can find available donations nearby using integrated coordinates on a interactive Leaflet map.
- **Analytics & Impact Tracker**: Admin dashboard tracking total users, active organizations, and delivered meals.
- **Secure Authentication**: Cookie-based JWT sessions, password recovery via email OTP, and route guarding.

---

## Tech Stack

- **Frontend**: React (Vite), React Router, Leaflet Maps, Axios, Formik, Yup
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Nodemailer (OTP emails)

---

## Core API Endpoints

### Authentication
- `POST /auth/signup` - Register a new user (Restaurant, NGO, or Admin).
- `POST /auth/login` - Authenticate user and return HTTP-only JWT cookie.
- `POST /auth/logout` - Clear user authentication cookie.
- `POST /auth/generate-otp` - Generate and email verification OTP for password recovery.
- `POST /auth/verify-otp` - Verify email OTP.
- `POST /auth/reset-password` - Reset password using verified OTP token.

### Restaurant Operations
- `GET /restaurant` - Fetch all donations posted by the logged-in restaurant.
- `POST /restaurant` - List a new surplus food donation.
- `PATCH /restaurant/:id` - Edit a donation's description or quantity.
- `DELETE /restaurant/:id` - Remove a donation.

### NGO Operations
- `GET /ngo` - Fetch all available food donations.
- `POST /ngo/accept-donation` - Claim an available food donation.
- `GET /ngo/accepted-donation` - List active claimed donations.
- `GET /ngo/delivered-donation` - List history of completed deliveries.
- `POST /ngo/deliver-donation` - Mark a claimed donation as delivered.

### Admin Operations
- `GET /admin/analytics` - Fetch metrics statistics for users, roles, and deliveries.
- `GET /admin/donations` - Retrieve all donations in the database.
- `PATCH /admin/donation-status/:id` - Update status of any donation.
- `GET /admin/user-management` - Retrieve list of all users.
- `PATCH /admin/block-user/:id` - Block a user account.
- `PATCH /admin/unblock-user/:id` - Unblock a user account.