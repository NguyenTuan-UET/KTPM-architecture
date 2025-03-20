//kiểm tra xem thư mục đã tồn tại chưa, nếu chưa thì tạo mới
const fs = require("fs");
const path = require("path");

function ensureFoldersExist(folders) {
    folders.forEach((dir) => {
        const dirPath = path.join(__dirname, "..", dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Created directory: ${dirPath}`);
        }
    });
}

module.exports = ensureFoldersExist;
