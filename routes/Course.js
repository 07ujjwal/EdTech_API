const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
} = require("../controller/Course");

const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controller/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controller/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controller/Subsection");

const {
  createRating,
  getAverageRating,
  getAllRatings,
} = require("../controller/RatingAndReview");

const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer");

//Course routes

// Courses can Only be Created by Instructors
router.post(
  "/createCourse",
  auth,
  isInstructor,
  upload.single("thumbnail"),
  createCourse
);
// Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// Update a Section
router.put("/updateSection", auth, isInstructor, updateSection);
// Delete a Section
router.delete("/deleteSection/:sectionId", auth, isInstructor, deleteSection);
// Edit Sub Section
router.patch(
  "/updateSubSection/:subSectionId",
  auth,
  isInstructor,
  upload.single("videoFile"),
  updateSubSection
);
// Delete Sub Section
router.delete(
  "/deleteSubSection/:subSectionId/:sectionId",
  auth,
  isInstructor,
  deleteSubSection
);
// Add a Sub Section to a Section
router.post(
  "/addSubSection",
  auth,
  isInstructor,
  upload.single("videoFile"),
  createSubSection
);
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses);
// Get Details for a Specific Course
router.get("/courseDetails/:courseId", getCourseDetails);

//Category routes (Only by Admin)

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.get("/getCategoryPageDetails/:categoryId", categoryPageDetails);

//Rating and Review
router.post("/createRating", auth, isStudent, createRating);
router.post("/getAverageRating", getAverageRating);
router.post("/getReviews", getAllRatings);

module.exports = router;
