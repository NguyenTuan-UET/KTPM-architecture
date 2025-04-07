const amqplib = require("amqplib");
const { createPDF } = require("../utils/pdf");
const { sendToQueue } = require("../queues/sendToQueue");
const path = require("path");

(async () => {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();
  await ch.assertQueue("pdf_queue", { durable: true });

  ch.consume("pdf_queue", async (msg) => {
    const { translatedText, userId } = JSON.parse(msg.content.toString());
    const outputPath = path.resolve(__dirname, "..", "output", `${userId}.pdf`);
    try {
      await createPDF(translatedText, outputPath);
      console.log("✅ PDF đã tạo:", outputPath);
      ch.sendToQueue(
        "translate_done_queue",
        Buffer.from(JSON.stringify({ userId, pdfPath: outputPath })),
        { persistent: true }
      );
      ch.ack(msg);
    } catch (err) {
      console.error("❌ PDF lỗi:", err);
      ch.nack(msg, false, false);
    }
  });
})();
