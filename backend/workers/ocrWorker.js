const amqplib = require('amqplib');
const path = require('path');
const { image2text } = require('../utils/ocr');
const { sendToQueue } = require('../queues/sendToQueue');

(async () => {
  const conn = await amqplib.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue("ocr_queue", { durable: true }); // Đảm bảo queue tồn tại
<<<<<<< HEAD
  ch.prefetch(1); // Chỉ xử lý một thông điệp tại một thời điểm

  ch.consume('ocr_queue', async (msg) => {
=======
  ch.prefetch(4);
  ch.consume("ocr_queue", async (msg) => {
>>>>>>> main
    /**
     * Lấy đường dẫn file và userId từ thông điệp
     * Chuyển thành đường dẫn tuyệt đối
     * Đường dẫn file sẽ được sử dụng để đọc file ảnh và thực hiện OCR
     */
<<<<<<< HEAD
    const { filePath, userId } = JSON.parse(msg.content.toString());
    const absolutePath = path.resolve(__dirname, '..', filePath);

=======
>>>>>>> main
    try {
      const { filePath, fileHash } = JSON.parse(msg.content.toString());

      const absolutePath = path.resolve(__dirname, "..", filePath);
      const text = await image2text(absolutePath);
      // await new Promise((resolve) => setTimeout(resolve, 10000));
      await sendToQueue("translate_queue", { text, fileHash });
      console.log("✅ OCR done:", fileHash);
      ch.ack(msg); // Gửi ack để xác nhận đã xử lý xong thông điệp
    } catch (err) {
<<<<<<< HEAD
      console.error('❌ OCR lỗi:', err);
      ch.nack(msg, false, false); // Gửi nack  thông báo rằng thông điệp không  xử lý thành công
=======
      console.error("❌ OCR lỗi:", err);
      ch.nack(msg, false, false);
>>>>>>> main
    }
  });
})();
