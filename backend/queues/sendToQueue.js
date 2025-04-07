const amqplib = require("amqplib");

async function sendToQueue(queueName, msg) {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();
  await ch.assertQueue(queueName, { durable: true });
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {
    persistent: true,
  });
}

module.exports = { sendToQueue };
