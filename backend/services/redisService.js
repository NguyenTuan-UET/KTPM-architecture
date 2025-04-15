const redis = require("redis");

const redisClient = redis.createClient(); // Create local redis
// Connect to redis cache
async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Error connecting to Redis:", err);
    process.exit(1);
  }
}
connectRedis();

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

process.on("exit", () => {
  redisClient.quit();
});

// Get cache by key
async function getCache(key) {
  return await redisClient.get(key);
}
// Set cache with key, value and ttl (time to live)
async function setCache(key, value, ttl = 3600) {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  await redisClient.set(key, stringValue, { EX: ttl });
}

module.exports = { getCache, setCache };
