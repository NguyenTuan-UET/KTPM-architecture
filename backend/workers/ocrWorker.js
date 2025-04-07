const amqplib = require("amqplib");
const path = require("path");
const { image2text } = require("../utils/ocr");
const { sendToQueue } = require("../queues/sendToQueue");

(async () => {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();
  await ch.assertQueue("ocr_queue", { durable: true });

  ch.consume("ocr_queue", async (msg) => {
    const { filePath, userId } = JSON.parse(msg.content.toString());
    const absolutePath = path.resolve(__dirname, "..", filePath);
    console.log("Đường dẫn ảnh:", absolutePath);
    try {
      const text = await image2text(absolutePath);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Delay 10 giây (10000ms)
      await sendToQueue("translate_queue", { text, userId });
      console.log("✅ OCR done:", userId);
      ch.ack(msg);
    } catch (err) {
      console.error("❌ OCR lỗi:", err);
      ch.nack(msg, false, false);
    }
  });
})();
