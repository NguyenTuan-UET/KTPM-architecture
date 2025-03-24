const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { uploadImageToQueue } = require("./rabbitmq/producer");
const ensureFoldersExist = require("./utils/initFolders"); // Import hàm kiểm tra thư mục

const app = express();
const port = 3001;

// Kiểm tra và tạo thư mục
ensureFoldersExist(["data", "output"]);

// Cấu hình Multer để giữ nguyên định dạng file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const UPLOAD_DIR = "data/";
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// API Upload formData chứa file ảnh tên image (xem frontend/src/API/upload_api.js)
app.post("/upload", upload.single("image"), uploadImageToQueue);

// Cung cấp file PDF qua URL
app.use("/output", express.static("output"));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
