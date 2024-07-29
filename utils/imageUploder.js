const cloudinary = require("cloudinary").v2;

const uploadImageToCloudinary = (filePath, folder, width, height) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: folder,
        transformation: [{ width: width, height: height, crop: "limit" }],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

module.exports = { uploadImageToCloudinary };
