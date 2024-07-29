const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("DB Connection Failed");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDb;
