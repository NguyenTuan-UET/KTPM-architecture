const amqplib = require("amqplib");
const { createPDF } = require("../utils/pdf");
const path = require("path");

(async () => {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();
  await ch.assertQueue("pdf_queue", { durable: false });

  ch.consume("pdf_queue", async (msg) => {
    const { translatedText, userId } = JSON.parse(msg.content.toString());
    const outputPath = path.resolve(__dirname, "..", "output", `${userId}.pdf`);
    try {
      await createPDF(translatedText, outputPath); // Tạo PDF
      console.log("✅ PDF đã tạo:", outputPath);

      /** Gửi thông điệp đến hàng đợi translate_done_queue
       * translate _done_queue: Hàng đợi này sẽ được sử dụng để thông báo rằng quá trình dịch đã hoàn tất và PDF đã được tạo thành công.
       */
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
