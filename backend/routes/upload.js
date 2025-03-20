//--------------[CÁC OUTPUT RIÊNG]---------------
// const multer = require("multer");
// const path = require("path");

// // Cấu hình multer để lưu file vào thư mục /data với tên mới
// const storage = multer.diskStorage({
//     destination: "data/",
//     filename: (req, file, cb) => {
//         const originalName = path.parse(file.originalname).name.replace(/\s+/g, "_"); // Xóa khoảng trắng
//         const extension = path.extname(file.originalname); // Lấy phần mở rộng (.jpg, .png)
//         const timestamp = Date.now(); // Thêm timestamp để tránh trùng lặp
//         const newFilename = `${originalName}_${timestamp}${extension}`; // Format đúng
//         cb(null, newFilename);
//     }
// });

// // Middleware để xử lý upload file
// const upload = multer({ storage });

// module.exports = upload;


//--------------[GHI ĐÈ CÁC OUTPUT]---------------
const multer = require("multer");
const path = require("path");

// Cấu hình multer để lưu file vào thư mục /data với tên input.<ext>
const storage = multer.diskStorage({
    destination: "data/",
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname); // Lấy phần mở rộng (.jpg, .png, ...)
        cb(null, `input${extension}`); // Luôn lưu là input.<ext>, ghi đè file cũ
    }
});

// Middleware xử lý upload file
const upload = multer({ storage });

module.exports = upload;