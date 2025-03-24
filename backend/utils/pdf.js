const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const FONT_PATH = path.resolve(__dirname, "..", "font", "Roboto-Regular.ttf");

function createPDF(text, pdfPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    try {
      doc.font(FONT_PATH).fontSize(14).text(text, 100, 100);
    } catch (error) {
      console.error("🚨 Lỗi khi load font:", error);
      return reject(error);
    }

    doc.end();
    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}

module.exports = { createPDF };
