const express = require("express");
const router = express.Router();
const {
  login,
  signUp,
  sendOTP,
  changePassword,
} = require("../controller/Auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controller/ResetPassword");

const { auth } = require("../middleware/authMiddleware");

// Routes for Login, Signup, and Authentication

// Authentication routes

// Route for user login
router.post("/login", login);

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP);

// Route for user signup
router.post("/signup", signUp);

// Route for Changing the password
router.post("/changepassword", auth, changePassword);

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

module.exports = router;
