const amqplib = require('amqplib');
const { translate } = require('../utils/translate');
const { sendToQueue } = require('../queues/sendToQueue');

(async () => {
  const conn = await amqplib.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue("translate_queue", { durable: true });
  ch.prefetch(2);
  ch.consume("translate_queue", async (msg) => {
    const { text, fileHash } = JSON.parse(msg.content.toString());
    try {
      const translatedText = await translate(text);
      await sendToQueue("pdf_queue", { translatedText, fileHash });
      console.log("✅ Translate done:", fileHash);
      ch.ack(msg);
    } catch (err) {
      console.error('❌ Translate lỗi:', err);
      ch.nack(msg, false, false);
    }
  });
})();
