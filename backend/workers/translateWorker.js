const amqplib = require('amqplib');
const { translate } = require('../utils/translate');
const { sendToQueue } = require('../queues/sendToQueue');

(async () => {
  const conn = await amqplib.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue('translate_queue', { durable: false });

  ch.consume('translate_queue', async (msg) => {
    const { text, userId } = JSON.parse(msg.content.toString());
    try {
      const translatedText = await translate(text);
      await sendToQueue('pdf_queue', { translatedText, userId });
      console.log('✅ Translate done:', userId);
      ch.ack(msg);
    } catch (err) {
      console.error('❌ Translate lỗi:', err);
      ch.nack(msg, false, false);
    }
  });
})();
