/**
 * @file app.js
 * @description Express server for handling file uploads and processing with RabbitMQ.
 */

const express = require("express");
const multer = require("multer");
const { sendToQueue } = require("./queues/sendToQueue");
const ensureFolderExists = require("./utils/initFolders");
const path = require("path");
const fs = require("fs");
const { getCache, setCache } = require("./services/redisService");
const { getFileByHash } = require("./services/databaseService");
const { hashFile } = require("./utils/hashFile");
const { checkHealth } = require("./utils/healthCheck");
const cors = require("cors");

const corsOptions = {
  origin: '*',
};
ensureFolderExists(["uploads", "output"]);

const app = express();
app.use(cors(corsOptions));
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rate limiting middleware to protect server
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 1000, // 1 minute
  max: 2000, // Limit each IP to 10 requests per windowMs
  message: "Too many requests, please try again later.",
});
// Api endpoint để upload file
app.post("/upload", upload.single("image"), async (req, res) => {
  //Get file path and hash
  const fileBuffer = req.file.buffer;
  const fileHash = await hashFile(fileBuffer);
  // Check file in redis cache
  const cachedFile = await getCache(fileHash);
  if (cachedFile) {
    // console.log("File đã tồn tại trong cache:", fileHash);
    return successResponse(res, fileHash);
  }
  // Check file in database, if it exists, save to redis cache and return success response
  const recordDatabase = await getFileByHash(fileHash);
  if (recordDatabase) {
    setCache(fileHash, recordDatabase.translated_text);
    return successResponse(res, fileHash);
  }

  // Save file to uploads
  const ext = path.extname(req.file.originalname);
  const newName = `${fileHash}${ext}`;
  const filePath = path.join("uploads", newName);
  fs.writeFileSync(filePath, fileBuffer);

  // Send message to ocr queue
  await sendToQueue("ocr_queue", { filePath, fileHash });
  req.file.buffer = null; // Clear file buffter
  return successResponse(res, fileHash);
});

// Api endpoint để checking trạng thái của file
app.get("/status/:fileHash", async (req, res) => {
  const { fileHash } = req.params;
  const filePath = path.join("output", `${fileHash}.pdf`);
  try {
    let translateText = await getCache(fileHash);

    // If doesn't exist in cache, check in database
    if (!translateText) {
      console.log("doesnt have cache");
      const fileRecord = await getFileByHash(fileHash);
      if (fileRecord) {
        translateText = fileRecord.translated_text;
        setCache(fileHash, translateText);
      }
    }
    console.log("cache have translateText")
    if (fs.existsSync(filePath)) {
      return res.json({
        ready: true,
        translate_text: translateText,
        downloadUrl: `/download/${fileHash}`,
      });
    } else {
      res.json({ ready: false, message: "File đang xử lý" });
    }
  } catch (error) {
    res.status(500).json({ "error ": error.message });
  }
});

// Api endpoint để download file
app.get("/download/:fileHash", (req, res) => {
  const { fileHash } = req.params;
  const filePath = path.join("output", `${fileHash}.pdf`);
  if (filePath && fs.existsSync(filePath)) {
    return res.download(filePath);
  }
});
app.use(limiter);
app.listen(3001, "0.0.0.0", () =>
  console.log("🚀 Server tại http://localhost:3001")
);

// Function to return success response
function successResponse(res, fileHash) {
  res.status(200).json({
    message: "File đã được upload thành công, đang chờ xử lý",
    statusUrl: `http://localhost:3001/status/${fileHash}`,
  });
}

app.get("/health", checkHealth);