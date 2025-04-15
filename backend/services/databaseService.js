/**
 * @file databaseService.js
 * @description Provides functions to interact with the SQLite database for file records.
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize SQLite database
const dbPath = path.resolve(__dirname, "../database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Lỗi khi kết nối cơ sở dữ liệu:", err.message);
    process.exit(1);
  }
});

// Create table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_hash TEXT UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    translated_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error("❌ Lỗi khi tạo bảng files:", err.message);
  }
});

function getFileByHash(fileHash) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM files WHERE file_hash = ?";
    db.get(query, [fileHash], (err, row) => {
      if (err) {
        console.error("❌ Lỗi khi truy vấn file:", err.message);
        return reject(err);
      }
      resolve(row || null); // Return null if no record is found
    });
  });
}

function saveFileRecord(fileHash, filePath, translated_text) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO files (file_hash, file_path, translated_text) VALUES (?, ?, ?)";
    db.run(query, [fileHash, filePath, translated_text], (err) => {
      if (err) {
        console.error("❌ Lỗi khi lưu file:", err.message);
        return reject(err);
      }
      resolve();
    });
  });
}

function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error("❌ Lỗi khi đóng cơ sở dữ liệu:", err.message);
    } else {
      console.log("✅ Kết nối cơ sở dữ liệu đã được đóng.");
    }
  });
}

// Handle process exit to close the database connection
process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

module.exports = { getFileByHash, saveFileRecord };
