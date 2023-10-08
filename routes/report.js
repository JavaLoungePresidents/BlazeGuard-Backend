const ort = require("onnxruntime-node");
var express = require("express");
const jimp = require("jimp");
const { inRadius } = require("../utils/coordUtils");
const { connection } = require("../utils/db");

var router = express.Router();

const onnxModel = new ort.InferenceSession("best.onnx");

async function preprocessImage(base64Image, targetWidth, targetHeight) {
  try {
    const imageBuffer = Buffer.from(base64Image, "base64");
    // Read the image data and convert it to a Jimp image
    const image = await jimp.read(imageBuffer);

    // Resize the image to match the target dimensions while preserving the aspect ratio
    image.resize(targetWidth, targetHeight);

    // Convert the image to a Float32Array with pixel values normalized to the range [0, 1]
    const inputImageData = new Float32Array(targetWidth * targetHeight * 3);
    let pixelIndex = 0;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const pixel = jimp.intToRGBA(image.getPixelColor(x, y));
        inputImageData[pixelIndex++] = pixel.r / 255; // Red channel
        inputImageData[pixelIndex++] = pixel.g / 255; // Green channel
        inputImageData[pixelIndex++] = pixel.b / 255; // Blue channel
      }
    }

    // Return the preprocessed image data as a Float32Array
    return inputImageData;
  } catch (error) {
    console.error("Image Preprocessing Error:", error);
    return null;
  }
}
async function performInference(imageData) {
  try {
    // Preprocess your input data as needed (e.g., resizing and normalizing)
    const preprocessedData = preprocessImage(imageData);

    // Create an ONNX Tensor from the preprocessed data
    const inputTensor = new ort.Tensor(
      "float32",
      preprocessedData,
      [1, 3, 640, 640]
    ); // Update shape if needed

    // Run inference
    const feeds = { input: inputTensor };
    const output = await onnxModel.run(feeds);

    return output;
  } catch (error) {
    console.error("Inference Error:", error);
    return null;
  }
}
router.post("/submit", async function(req, res, next) {
  const { report_datetime, image_validated, latitude, longitude } = req.body;
  const sql =
    "INSERT INTO reports (report_datetime, image_validated, latitude, longitude) VALUES (?, ?, ?, ?)";
  const values = [report_datetime, image_validated, latitude, longitude];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ error: "An error occurred while inserting data" });
    } else {
      console.log("Data inserted successfully:", result);
      res.status(200).json({ message: "Data inserted successfully" });
    }
  });
  if (req.body.image != null) {
    console.log(performInference(req.body.image));
  }
});
router.post("/reports", async function(req, res, next) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  const sql =
    "SELECT * FROM reports WHERE MONTH(report_datetime) = " + currentMonth;
  const reps = [];
  connection.query(sql, (err, results) => {
    results.forEach((r) => {
      console.log(parseFloat(r.latitude));
      console.log(parseFloat(r.longitude));
      if (
        inRadius(
          parseFloat(r.latitude),
          parseFloat(r.longitude),
          req.body.latitude,
          req.body.longitude,
          100
        )
      ) {
        reps.push(r);
      }
    });
    res.send(reps);
  });
});

module.exports = router;
