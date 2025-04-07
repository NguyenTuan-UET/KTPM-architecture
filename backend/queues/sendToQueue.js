const amqplib = require("amqplib");
/**
 * Hàm này thiết lập kết nối đến RabbitMQ và gửi một thông điệp đến hàng đợi đã chỉ định.
 * @param {*} queueName : Tên của queue để gửi thông điệp
 * @param {*} msg : Thông điệp sẽ gửi đến queue
 */
async function sendToQueue(queueName, msg) {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();
  await ch.assertQueue(queueName, { durable: true }); //durable Đảm bảo queue tồn tại
  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {
    persistent: true, // persitstent Đảm bảo thông điệp được lưu trữ trên đĩa, không bị mất khi RabbitMQ khởi động lại
  });
}

module.exports = { sendToQueue };
