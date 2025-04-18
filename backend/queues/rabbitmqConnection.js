const amqplib = require("amqplib");

let connection = null; //abc
let channel = null; //123

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
