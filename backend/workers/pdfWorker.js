const amqplib = require("amqplib");
const { createPDF } = require("../utils/pdf");
const { saveFileRecord } = require("../services/databaseService");
const path = require("path");

(async () => {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();
  await ch.assertQueue("pdf_queue", { durable: true });
  ch.prefetch(10);
  ch.consume("pdf_queue", async (msg) => {
    const { translatedText, fileHash } = JSON.parse(msg.content.toString());
    const outputPath = path.resolve(
      __dirname,
      "..",
      "output",
      `${fileHash}.pdf`
    );
    try {
      await createPDF(translatedText, outputPath); // Tạo PDF
      console.log("✅ PDF đã tạo:", outputPath);
      await saveFileRecord(fileHash, outputPath, translatedText);
      ch.ack(msg);
    } catch (err) {
      console.error("❌ PDF lỗi:", err);
      ch.nack(msg, false, false);
    }
  });
})();
