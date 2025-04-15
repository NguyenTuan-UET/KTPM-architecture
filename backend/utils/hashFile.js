const crypto = require("crypto");
const fs = require("fs");

function hashFile(fileBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash("md5");
      hash.update(fileBuffer);
      resolve(hash.digest("hex"));
    } catch (err) {
      reject(err);
    }
  });
}
module.exports = { hashFile };
