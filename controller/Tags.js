const Tag = require("../models/Tags");

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Both name and description are required",
      });
    }

    const tagDetails = await Tag.create({ name, description });

    return res.status(201).json({
      success: true,
      message: "Tag Created Successfully",
      tag: tagDetails,
    });
  } catch (error) {
    console.error("Error in createTag:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create tag",
      error: error.message,
    });
  }
};

exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, "name description");

    res.status(200).json({
      success: true,
      message: "All tags returned successfully",
      tags: allTags,
    });
  } catch (error) {
    console.error("Error in showAllTags:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message,
    });
  }
};
