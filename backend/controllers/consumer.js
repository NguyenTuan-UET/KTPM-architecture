const { image2text } = require("../utils/ocr");
const { translate } = require("../utils/translate");
const { createPDF } = require("../utils/pdf");
const { connectToQueue } = require("../rabbitmq/producer");
const fs = require("fs");
const path = require("path");

const QUEUE_NAME = "task_upload";
const OUTPUT_DIR = path.resolve(__dirname, "..", "output"); // Đường dẫn tuyệt đối

async function processMessage(msg, channel) {
  if (!msg) return;

  const startTime = Date.now(); // Bắt đầu đo thời gian
  let imagePath;

  try {
    // Parse message
    const data = JSON.parse(msg.content.toString());
    imagePath = data.imagePath;
    if (!imagePath)
      throw new Error("Không tìm thấy đường dẫn ảnh trong message!");

    // Tạo đường dẫn file tuyệt đối
    const absolutePath = path.resolve(__dirname, "..", imagePath);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`❌ File không tồn tại: ${absolutePath}`);
    }

    console.log("📂 Đang xử lý file:", absolutePath);

    // OCR - Trích xuất văn bản từ ảnh
    const extractedText = await image2text(absolutePath);
    console.log("📝 Văn bản trích xuất:", extractedText);

    // Dịch văn bản
    const translatedText = await translate(extractedText);
    console.log("🌍 Văn bản dịch:", translatedText);

    // Tạo file PDF
    const outputFilePath = path.join(OUTPUT_DIR, `${Date.now()}_output.pdf`);
    await createPDF(translatedText, outputFilePath);

    console.log("✅ PDF tạo thành công:", outputFilePath);

    // Xác nhận message đã xử lý thành công
    channel.ack(msg);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý file:", error.message);

    // Nếu lỗi do file không tồn tại, từ chối message (không requeue)
    if (error.message.includes("File không tồn tại")) {
      channel.nack(msg, false, false);
    } else {
      // Nếu là lỗi khác, vẫn giữ message trong queue để thử lại
      channel.nack(msg, false, true);
    }
  } finally {
    const elapsedTime = (Date.now() - startTime) / 1000;
    console.log(`⏳ Thời gian xử lý: ${elapsedTime}s\n`);
  }
}

async function processQueue() {
  try {
    const { connection, channel } = await connectToQueue();
    console.log("🎧 Worker đang chờ tin nhắn...");

    // Mỗi worker chỉ xử lý 1 message một lúc để tránh quá tải
    channel.prefetch(1);

    channel.consume(QUEUE_NAME, (msg) => processMessage(msg, channel));
  } catch (error) {
    console.error("🚨 Lỗi kết nối RabbitMQ:", error);
  }
}

processQueue().catch(console.error);
