const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploder");

exports.createCourse = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;
    const thumbnail = req.file;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userId = req.user.id;
    const [instructorDetails, tagDetails] = await Promise.all([
      User.findById(userId),
      Tag.findById(tag),
    ]);

    if (!instructorDetails || !tagDetails) {
      return res.status(404).json({
        success: false,
        message: !instructorDetails
          ? "Instructor Details not found"
          : "Tag Details not found",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail.path,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    await Promise.all([
      User.findByIdAndUpdate(
        instructorDetails._id,
        { $push: { courses: newCourse._id } },
        { new: true }
      ),
      Tag.findByIdAndUpdate(
        tagDetails._id,
        { $push: { courses: newCourse._id } },
        { new: true }
      ),
    ]);

    return res.status(201).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Course",
      error: error.message,
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({})
      .populate("instructor", "name email")
      .populate("tag", "name description");

    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Cannot Fetch course data",
      error: error.message,
    });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseDetails = await Course.findById(courseId)
      .populate("instructor", "name email")
      .populate("tag", "name description")
      .populate("studentsEnrolled", "name email");

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
      error: error.message,
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    const course = await Course.findByIdAndUpdate(courseId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("instructor", "name email")
      .populate("tag", "name description");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Remove course from instructor's courses array
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { courses: courseId },
    });

    // Remove course from tag's courses array
    await Tag.findByIdAndUpdate(course.tag, {
      $pull: { courses: courseId },
    });

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error: error.message,
    });
  }
};
