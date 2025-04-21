const { redisClient } = require("../services/redisService");
const { getRabbitMQChannel } = require("../queues/rabbitmqConnection");
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("child_process");

async function checkWorkerStatus(workerName) {
  return new Promise((resolve) => {
    exec(`pm2 list`, (error, stdout) => {
      if (error) {
        console.error(
          `❌ Worker ${workerName} không hoạt động: ${error.message}`
        );
        return resolve(false);
      }
      const isOnline = stdout.includes(workerName) && stdout.includes("online");
      if (isOnline) {
        // console.log(`✅ Worker ${workerName} đang hoạt động và sẵn sàng.`);
      } else {
        console.error(
          `❌ Worker ${workerName} không hoạt động hoặc không ở trạng thái online.`
        );
      }
      resolve(isOnline);
    });
  });
}

async function checkHealth(req, res) {
  const healthStatus = {
    redis: false,
    rabbitmq: false,
    database: false,
    ocrWorker: false,
    pdfWorker: false,
    translateWorker: false,
  };

  // Kiểm tra Redis
  try {
    const pong = await redisClient.ping();
    if (pong === "PONG") {
      healthStatus.redis = true;
      // console.log('✅ Redis kết nối thành công và sẵn sàng.');
    } else {
      console.error("❌ Redis kết nối không thành công.");
    }
  } catch (err) {
    console.error("❌ Redis không hoạt động:", err.message);
  }

  // Kiểm tra RabbitMQ
  try {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue("", { durable: false });
    healthStatus.rabbitmq = true;
    // console.log('✅ RabbitMQ kết nối thành công và queue đã được xác nhận.');
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
    // console.log('✅ SQLite Database kết nối thành công và hoạt động ổn định.');
  } catch (err) {
    console.error("❌ Database không hoạt động:", err.message);
  }

  // Kiểm tra các worker
  healthStatus.ocrWorker = await checkWorkerStatus("ocrWorker");
  healthStatus.pdfWorker = await checkWorkerStatus("pdfWorker");
  healthStatus.translateWorker = await checkWorkerStatus("translateWorker");

  // Trả về kết quả kiểm tra
  const statusMessage = {
    status: "UP",
    services: healthStatus,
  };

  // Nếu tất cả các dịch vụ đều hoạt động, log tổng quan
  if (Object.values(healthStatus).every(status => status === true)) {
    // console.log('✅ Tất cả các dịch vụ đang hoạt động bình thường.');
  } else {
    console.error("❌ Một số dịch vụ không hoạt động, vui lòng kiểm tra lại.");
  }

  res.status(200).json(statusMessage);
}

module.exports = { checkHealth };
