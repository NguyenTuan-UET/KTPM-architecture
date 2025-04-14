<<<<<<< HEAD
const amqplib = require('amqplib');
/**
 * Hàm này thiết lập kết nối đến RabbitMQ và gửi một thông điệp đến hàng đợi đã chỉ định.
 * @param {*} queueName : Tên của queue để gửi thông điệp
 * @param {*} msg : Thông điệp sẽ gửi đến queue
 */
async function sendToQueue(queueName, msg) {
  const conn = await amqplib.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue(queueName, { durable: false }); //durable Đảm bảo queue tồn tại
=======
const { getRabbitMQChannel } = require("./rabbitmqConnection");

async function sendToQueue(queueName, msg) {
  const ch = await getRabbitMQChannel();
  await ch.assertQueue(queueName, { durable: true });
>>>>>>> main
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {
    persistent: true,
  });
}

module.exports = { sendToQueue };
