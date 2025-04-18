const { redisClient } = require("../services/redisService");
const { getRabbitMQChannel } = require("../queues/rabbitmqConnection");
const sqlite3 = require("sqlite3").verbose();

async function checkHealth(req, res) {
  const healthStatus = {
    redis: false,
    rabbitmq: false,
    database: false,
  };

  // Kiểm tra Redis
  try {
    // Sử dụng lệnh PING để kiểm tra kết nối Redis
    const pong = await redisClient.ping();
    if (pong === "PONG") {
      healthStatus.redis = true;
    }
  } catch (err) {
    console.error("❌ Redis không hoạt động:", err.message);
  }

  // Kiểm tra RabbitMQ
  try {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue("health_check_queue", { durable: false });
    healthStatus.rabbitmq = true;
  } catch (err) {
    console.error("❌ RabbitMQ không hoạt động:", err.message);
  }

  // Kiểm tra SQLite Database
  try {
    const db = new sqlite3.Database("./database.sqlite");
    await new Promise((resolve, reject) => {
      db.get("SELECT 1", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    healthStatus.database = true;
    db.close();
  } catch (err) {
    console.error("❌ Database không hoạt động:", err.message);
  }

  res.status(200).json({
    status: "UP",
    services: healthStatus,
  });
}

module.exports = { checkHealth };