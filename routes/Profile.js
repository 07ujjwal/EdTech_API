const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controller/Profile");
const { upload } = require("../middleware/multer"); // Corrected import

router.delete("/deleteProfile", deleteAccount);
router.patch("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

router.patch(
  "/updateDisplayPicture",
  auth,
  upload.single("displayPicture"),
  updateDisplayPicture
);

module.exports = router;
