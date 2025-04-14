const { getRabbitMQChannel } = require("./rabbitmqConnection");

async function sendToQueue(queueName, msg) {
  const ch = await getRabbitMQChannel();
  await ch.assertQueue(queueName, { durable: true });
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {
    persistent: true,
  });
}

module.exports = { sendToQueue };
