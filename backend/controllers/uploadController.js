//--------------[CÁC OUTPUT RIÊNG]---------------
// const path = require("path");
// const fs = require("fs");

// const ocr = require("../utils/ocr");
// const { createPDF } = require("../utils/pdf");
// const { translate } = require("../utils/translate");

// async function processUpload(req, res) {
//     try {
//         const imagePath = path.join("data", req.file.filename);
        
//         // Lấy tên file từ req.file.filename, giữ nguyên timestamp
//         const originalNameWithTimestamp = path.parse(req.file.filename).name; // "hello_world_{timestamp}"
        
//         // OCR - Chuyển ảnh thành văn bản
//         const text = await ocr.image2text(imagePath);
//         console.log("OCR Output:", text);

//         // Dịch sang tiếng Việt
//         const viText = await translate(text);
//         console.log("Translated Text:", viText);

//         // Lưu file PDF với format: translate_hello_world_{timestamp}.pdf
//         const pdfFilename = translate_${originalNameWithTimestamp}.pdf;
//         const pdfPath = path.join("output", pdfFilename);
        
//         createPDF(viText, pdfPath);
//         console.log("Generated PDF:", pdfPath);

//         res.json({ pdfUrl: /output/${pdfFilename} });
//     } catch (e) {
//         res.status(500).json({ error: "Error processing file" });
//         console.error(e);
//     }
// }

// module.exports = processUpload;


//--------------[GHI ĐÈ CÁC OUTPUT]---------------

const path = require("path");
const fs = require("fs");

const ocr = require("../utils/ocr");
const { createPDF } = require("../utils/pdf");
const { translate } = require("../utils/translate");

async function processUpload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const imagePath = path.join("data", req.file.filename);
        
        // OCR - Chuyển ảnh thành văn bản
        const text = await ocr.image2text(imagePath);
        console.log("OCR Output:", text);

        // Dịch sang tiếng Việt
        const viText = await translate(text);
        console.log("Translated Text:", viText);

        // Ghi đè vào file `output.pdf`
        const pdfPath = createPDF(viText);
        console.log("Generated PDF:", pdfPath);

        res.json({ pdfUrl: "/output/output.pdf" });
    } catch (e) {
        res.status(500).json({ error: "Error processing file" });
        console.error(e);
    }
}

module.exports = processUpload;
 