const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Helper function to send a response
const sendResponse = (res, success, message, statusCode = 200) => {
  res.status(statusCode).json({ success, message });
};

// Generate a secure token
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return sendResponse(res, false, "Email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(
        res,
        false,
        "Your email is not registered with us",
        404
      );
    }

    const token = generateToken();
    const tokenExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    await User.findOneAndUpdate(
      { email },
      { token: token, resetPasswordExpires: tokenExpiry },
      { new: true }
    );

    const url = `http://localhost:3000/update-password/${token}`;
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: <a href="${url}">${url}</a>`
    );

    return sendResponse(
      res,
      true,
      "Email sent successfully, please check your email to change your password"
    );
  } catch (error) {
    console.error(error);
    return sendResponse(
      res,
      false,
      "Something went wrong while sending reset password email",
      500
    );
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    // Validate inputs
    if (!password || !confirmPassword || !token) {
      return sendResponse(res, false, "All fields are required", 400);
    }

    if (password !== confirmPassword) {
      return sendResponse(res, false, "Passwords do not match", 400);
    }

    const user = await User.findOne({ token: token });

    if (!user) {
      return sendResponse(res, false, "Invalid token", 400);
    }

    if (user.resetPasswordExpires < Date.now()) {
      return sendResponse(
        res,
        false,
        "Token has expired, please regenerate your token",
        400
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { resetPasswordToken: token },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      { new: true }
    );

    return sendResponse(res, true, "Password reset successful", 200);
  } catch (error) {
    console.error(error);
    return sendResponse(
      res,
      false,
      "Something went wrong while resetting password",
      500
    );
  }
};
