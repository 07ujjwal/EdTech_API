const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { course_id } = req.body;
  const userId = req.user.id;

  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid course ID",
    });
  }

  try {
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Could not find the course",
      });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "Student is already enrolled",
      });
    }

    const amount = course.price;
    const currency = "INR";
    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: course_id,
        userId,
      },
    };

    const paymentResponse = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate order",
      error: error.message,
    });
  }
};

// Verify Signature of Razorpay and Server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.headers["x-razorpay-signature"];
  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature !== digest) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }

  console.log("Payment is Authorized");

  const { courseId, userId } = req.body.payload.payment.entity.notes;

  try {
    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      { $push: { courses: courseId } },
      { new: true }
    );

    const emailResponse = await mailSender(
      enrolledStudent.email,
      "Congratulations from CodeHelp",
      "Congratulations, you are onboarded into new CodeHelp Course"
    );

    console.log(emailResponse);

    return res.status(200).json({
      success: true,
      message: "Signature Verified and Course Added",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
