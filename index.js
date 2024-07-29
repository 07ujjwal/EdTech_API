const express = require("express");
const bodyParser = require("body-parser");
const connectDb = require("./config/database");
const usersRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payments");
const tagRoutes = require("./routes/Tags");
const { cloudinaryConnect } = require("./config/cloudinary");

const app = express();
const port = 3000;

// Body-parser middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

cloudinaryConnect();

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Use route files
app.use("/api/v1/auth", usersRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/tags", tagRoutes);

const startServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
