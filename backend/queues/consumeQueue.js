const amqplib = require("amqplib");

const completedJobs = new Map(); // Lưu trữ các công việc đã hoàn thành

/**
 * Hàm này thiết lập kết nối đến RabbitMQ và tiêu thụ thông điệp từ queue `translate_done_queue`.
 * Khi nhận được thông điệp, nó lưu thông tin về PDF Path đã tạo và xác nhận thông điệp đã được xử lý thành công.
 */

async function startConsumer() {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();

  await ch.assertQueue("translate_done_queue", { durable: true });

  ch.consume("translate_done_queue", async (msg) => {
    const { userId, pdfPath } = JSON.parse(msg.content.toString());
    console.log(`✅ PDF đã tạo xong: ${pdfPath}`);
    completedJobs.set(userId, pdfPath);
    ch.ack(msg);
  });
}

module.exports = { startConsumer, completedJobs };
