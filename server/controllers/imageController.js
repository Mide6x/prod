const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const ProcessedImage = require("../models/processedImageModel");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Set up multer storage with dynamic folder creation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Controller to handle image upload
exports.uploadImage = async (req, res) => {
  try {
    // Use multer to handle the file upload
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to upload image', error: err.message });
      }

      const filePath = req.file.path;

      try {
        const transformedUrl = await uploadAndTransformImage(filePath, req.body.amount);

        fs.unlinkSync(filePath); 

        res.status(200).json({ imageUrl: transformedUrl });
      } catch (error) {
        console.error(`Failed to upload image: ${error.message}`);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
      }
    });
  } catch (error) {
    console.error(`Failed to upload image: ${error.message}`);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

const downloadImage = async (url, savePath) => {
  try {
    const response = await axios({ url, responseType: "stream" });
    await pipeline(response.data, fs.createWriteStream(savePath));
    console.log(`Image successfully 🎉 downloaded and saved to ${savePath}`);
  } catch (error) {
    console.error(
      `Failed 😔 to download image. URL: ${url}, Path: ${savePath}, Error: ${error.message}`
    );
    throw error;
  }
};

const uploadAndTransformImage = async (filePath, amount) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      transformation: [
        {
          background: "#FFFFFF",
          gravity: "center",
          height: 500,
          width: 1170,
          crop: "pad",
        },
        {
          color: "#FFFFFF",
          overlay: {
            font_family: "verdana",
            font_size: 71,
            font_weight: "bold",
            text_align: "left",
            text: `x${amount}`,
          },
        },
        { background: "#069f7e" },
        { quality: "auto:best" },
        { fetch_format: "auto" },
        { effect: "sharpen:90" },
        { flags: "layer_apply", gravity: "east", x: "0.2" },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error(
      `Failed 😔 to upload and transform image. Error: ${error.message}`
    );
    throw error;
  }
};

// Endpoint to process images
exports.processImages = async (req, res) => {
  console.log("Request body:", req.body);

  const { images } = req.body;

  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: "No images provided 🤔" });
  }

  try {
    const results = [];

    for (const image of images) {
      const imageName = image["Product Name"];
      const imageUrl = image["Image URL"];
      const amount = image["Amount"];

      console.log(
        `Processing image: ${imageName}, URL: ${imageUrl}, Amount: ${amount}`
      );

      if (!imageName || !imageUrl || amount === undefined) {
        console.error(`Invalid image data: ${JSON.stringify(image)}`);
        continue;
      }

      const filePath = path.join(
        __dirname,
        "temp",
        `${imageName.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`
      );
      await downloadImage(imageUrl, filePath);

      const transformedUrl = await uploadAndTransformImage(filePath, amount);

      const processedImage = new ProcessedImage({
        manufacturerName: image["Manufacturer Name"],
        brand: image["Brand"],
        productName: image["Product Name"],
        productCategory: image["Product Category"],
        variantType: image["Variant Type"],
        variant: image["Variant"],
        weight: image["Weight"],
        imageUrl: transformedUrl,
      });

      await processedImage.save();

      results.push({
        ...image,
        imageUrl: transformedUrl,
      });

      fs.unlinkSync(filePath);
    }

    console.log("Results:", results);

    res.status(200).json({ results });
  } catch (error) {
    console.error(`Failed 😔 to process images: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed 😔 to process images", error: error.message });
  }
};

// Get processed Images
exports.getProcessedImages = async (req, res) => {
  try {
    const images = await ProcessedImage.find();
    res.json(images);
  } catch (error) {
    console.error("Error fetching processed images:", error);
    res.status(500).json({ message: "Failed to fetch processed images" });
  }
};

// After processing, delete the images
exports.deleteAllProcessedImages = async (req, res) => {
  try {
    const { imageIds } = req.body;
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ message: "No image IDs provided." });
    }
    await ProcessedImage.deleteMany({ _id: { $in: imageIds } });
    res.status(200).json({ message: "Processed images deleted successfully." });
  } catch (error) {
    console.error("Error deleting processed images:", error);
    res.status(500).json({ message: "Failed to delete processed images." });
  }
};