const amqplib = require("amqplib");

const completedJobs = new Map(); 

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
