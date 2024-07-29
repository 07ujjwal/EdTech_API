const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

// Helper function to send a response
const sendResponse = (res, success, message, statusCode = 200, data = {}) => {
  res.status(statusCode).json({ success, message, ...data });
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, false, "Email is required", 400);
    }

    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return sendResponse(res, false, "User already registered", 401);
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP generated:", otp);

    let result;
    do {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
      console.log("Result", result);
    } while (result);

    const otpPayload = { email, otp };

    await OTP.create(otpPayload);

    return sendResponse(res, true, "OTP sent successfully", 200, { otp });
  } catch (error) {
    console.error(error);
    return sendResponse(res, false, error.message, 500);
  }
};

// Sign Up
exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return sendResponse(res, false, "All fields are required", 403);
    }

    if (password !== confirmPassword) {
      return sendResponse(
        res,
        false,
        "Password and ConfirmPassword values do not match",
        400
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendResponse(res, false, "User is already registered", 400);
    }

    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!recentOtp || otp !== recentOtp.otp) {
      return sendResponse(res, false, "Invalid OTP", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return sendResponse(res, true, "User registered successfully", 200, {
      user,
    });
  } catch (error) {
    console.error(error);
    return sendResponse(
      res,
      false,
      "User cannot be registered. Please try again",
      500
    );
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, false, "All fields are required", 403);
    }

    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return sendResponse(
        res,
        false,
        "User not registered, please sign up first",
        401
      );
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return sendResponse(res, false, "Incorrect password", 401);
    }
  } catch (error) {
    console.error(error);
    return sendResponse(res, false, "Login failed, please try again", 500);
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return sendResponse(res, false, "All fields are required", 400);
    }

    if (newPassword !== confirmNewPassword) {
      return sendResponse(res, false, "New passwords do not match", 400);
    }

    const user = await User.findById(req.user.id);

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return sendResponse(res, false, "Old password is incorrect", 401);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await mailSender(
      user.email,
      "Password Changed",
      "Your password has been updated successfully."
    );

    return sendResponse(res, true, "Password changed successfully", 200);
  } catch (error) {
    console.error(error);
    return sendResponse(
      res,
      false,
      "Password change failed, please try again",
      500
    );
  }
};
