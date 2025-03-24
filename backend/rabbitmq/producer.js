/**
 * Import library
 */
const amqp = require("amqplib");
const path = require("path");

// Upload Directory

const QUEUE_NAME = "task_upload";

async function connectToQueue() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    return { connection, channel };
  } catch (error) {
    throw new Error(`Không thể kết nối tới RabbitMQ: ${error.message}`);
  }
}

async function uploadImageToQueue(req, res) {
  let connection;
  let channel;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Vui lòng tải lên một file" });
    }

    const imagePath = path.join("data", req.file.filename);
    ({ connection, channel } = await connectToQueue());

    const msg = JSON.stringify({ imagePath });
    channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), {
      persistent: true,
    });

    console.log(`Đã gửi vào queue: ${msg}`);
    res.send({ message: "File uploaded, processing..." });
  } catch (error) {
    console.error("Lỗi:", error.message);
    res.status(500).send({ message: "Có lỗi xảy ra khi xử lý file" });
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

module.exports = { uploadImageToQueue ,connectToQueue};
