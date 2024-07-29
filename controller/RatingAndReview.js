const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

// Create Rating and Review
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;

    // Check if user is enrolled in the course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: userId,
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // Check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user",
      });
    }

    // Create rating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    // Update course with this rating/review
    await Course.findByIdAndUpdate(courseId, {
      $push: { ratingAndReviews: ratingReview._id },
    });

    return res.status(200).json({
      success: true,
      message: "Rating and Review created Successfully",
      ratingReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Average Rating
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Calculate average rating
    const result = await RatingAndReview.aggregate([
      { $match: { course: mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const message =
      averageRating > 0
        ? "Average Rating calculated successfully"
        : "Average Rating is 0, no ratings given till now";

    return res.status(200).json({
      success: true,
      message,
      averageRating,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Ratings and Reviews
exports.getAllRatings = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({ path: "user", select: "firstName lastName email image" })
      .populate({ path: "course", select: "courseName" });

    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
