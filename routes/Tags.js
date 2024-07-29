const express = require("express");
const router = express.Router();
const { createTag, showAllTags } = require("../controller/Tags");
const { auth, isAdmin } = require("../middleware/authMiddleware");

router.post("/create-tags", auth, isAdmin, createTag);

router.get("/shot-all-tags", showAllTags);

module.exports = router;
