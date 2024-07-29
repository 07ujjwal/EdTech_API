const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const categoryDetails = await Category.create({ name, description });
    console.log(categoryDetails);
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    return res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch the selected category along with its courses
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
    }

    // Fetch courses for different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    // Fetch top 10 selling courses
    const topSellingCourses = await Course.find()
      .sort({ studentsEnrolled: -1 })
      .limit(10)
      .exec();

    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
        topSellingCourses,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
