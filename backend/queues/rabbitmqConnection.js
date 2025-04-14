const amqplib = require("amqplib");

let connection = null;
let channel = null;

async function getRabbitMQChannel() {
  if (!connection) {
    connection = await amqplib.connect("amqp://localhost");
  }
  if (!channel) {
    channel = await connection.createChannel();
  }
  return channel;
}

module.exports = { getRabbitMQChannel };
