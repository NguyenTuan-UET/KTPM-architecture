/**
 * @file app.js
 * @description Express server for handling file uploads and processing with RabbitMQ.
 */

const express = require('express');
const multer = require('multer');
const { sendToQueue } = require('./queues/sendToQueue');
const { completedJobs, startConsumer } = require('./queues/consumeQueue');
const ensureFolderExists = require('./utils/initFolders');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const port = 3001;

const corsOptions = {
  origin: '*',
};
ensureFolderExists(['uploads', 'output']);
// Lắng nghe từ hàng đợi translate_done_queue
// Khi nhận được thông điệp, lưu đường dẫn file PDF vào completedJobs
startConsumer();

const app = express();
app.use(cors(corsOptions));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const userId = Date.now().toString();
    const newName = `${userId}${ext}`;
    cb(null, newName);
    req.savedFile = {
      filePath: path.join('uploads', newName),
      userId,
    };
  },
});
const upload = multer({ storage });
// Api endpoint để upload file

app.post('/upload', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  const userId = Date.now().toString();

  await sendToQueue('ocr_queue', { filePath, userId });

  res.json({
    message: 'File của bạn đang được xử lý.',
    userId,
    statusUrl: `http://localhost:3001/status/${userId}`,
  });
});

// Api endpoint để checking trạng thái của file
app.get('/status/:userId', (req, res) => {
  const { userId } = req.params;
  const filePath = completedJobs.get(userId);
  if (filePath && fs.existsSync(filePath)) {
    return res.json({ ready: true, downloadUrl: `/download/${userId}` });
  }
  res.json({ ready: false });
});

// Api endpoint để download file
app.get('/download/:userId', (req, res) => {
  const { userId } = req.params;
  const filePath = completedJobs.get(userId);
  if (filePath && fs.existsSync(filePath)) {
    return res.download(filePath);
  }
  res.status(404).send('⏳ PDF chưa sẵn sàng. Thử lại sau.');
});

app.listen(3001, "0.0.0.0", () =>
  console.log("🚀 Server tại http://localhost:3001")
);
