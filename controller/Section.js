const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    const newSection = await Section.create({ sectionName });

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { courseContent: newSection._id },
      },
      { new: true }
    ).populate("courseContent");

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create Section, please try again",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
      section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update Section, please try again",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    // Find the section by ID
    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Get the subsections associated with this section
    const subSections = section.subSection;

    if (subSections) {
      // Delete all related subsections
      await SubSection.deleteMany({ _id: { $in: subSections } });
    }

    // Remove the section from courses
    await Course.updateMany(
      { courseContent: sectionId },
      { $pull: { courseContent: sectionId } }
    );

    // Delete the section
    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section and related subsections deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete Section, please try again",
      error: error.message,
    });
  }
};
