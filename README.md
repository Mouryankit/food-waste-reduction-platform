# Food Waste Reduction Platform

## Tech Stack

- Node.js
- Express.js
- dotenv
- React

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Check if the server is running |
| POST | `/auth/login` | login route return token |
| POST | `/auth/signup` | signup route add user in the database |
| POST | `/auth/generate-otp` | generating the otp if user want to change the password |
| POST | `/auth/verify-otp` | verify the otp send to the user's gmail |
| POST | `/auth/reset-password` | this route identify the token send during verify-otp route and reset the password |
| get | `/restaurant` | get all donation donated by restaurant only |
| POST | `/restaurant` | create new donation by restaurant only |