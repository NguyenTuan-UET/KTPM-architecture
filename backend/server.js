const express = require("express");
const cors = require("cors");
const upload = require("./routes/upload");
const processUpload = require("./controllers/uploadController");
const ensureFoldersExist = require("./utils/initFolders"); // Import hàm kiểm tra thư mục

const app = express();
const port = 3001;

// Kiểm tra và tạo thư mục
ensureFoldersExist(["data", "output"]);

app.use(cors());
app.use(express.json());

// API Upload formData chứa file ảnh tên image (xem frontend/src/API/upload_api.js) 
app.post("/upload", upload.single("image"), processUpload);

// Cung cấp file PDF qua URL
app.use("/output", express.static("output"));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
