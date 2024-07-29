const cloudinary = require("cloudinary").v2;

const uploadVideoToCloudinary = (filePath, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: "video",
        folder: folder,
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

module.exports = { uploadVideoToCloudinary };
