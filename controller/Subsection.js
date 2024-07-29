const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploder");
const { uploadVideoToCloudinary } = require("../utils/videoUploder");

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;
    const video = req.file;

    console.log("Uploaded File:", video);

    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const uploadDetails = await uploadVideoToCloudinary(
      video.path,
      process.env.FOLDER_NAME
    );

    const subSectionDetails = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadDetails.secure_url,
    });

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSection: subSectionDetails._id },
      },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
      updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const { title, timeDuration, description } = req.body;
    const video = req.file;

    if (!subSectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let updateData = { title, timeDuration, description };

    if (video) {
      const uploadDetails = await uploadVideoToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      updateData.videoUrl = uploadDetails.secure_url;
    }

    const updatedSubSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Sub Section Updated Successfully",
      updatedSubSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update Sub Section, please try again",
      error: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.params;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
