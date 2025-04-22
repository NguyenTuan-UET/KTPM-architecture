# 📘 Case Study 2 — Image to Vietnamese PDF Converter

## 👨‍💻 Group 8: INT3105_1
1. **Bùi Đức Luân** – 21020775  
2. **Phạm Tất Thành** – 22028205  
3. **Nguyễn Quang Tuấn** – 22028209  

---

## 📝 Overview

This project demonstrates a complete pipeline for converting English text from an image into a Vietnamese-translated PDF file. The core process includes:

1. **OCR (Optical Character Recognition)** – Extracting English text from an image.  
2. **Translation** – Translating the extracted English text into Vietnamese.  
3. **PDF Generation** – Converting the translated Vietnamese text into a downloadable PDF.

The main application orchestrates these steps sequentially to provide a seamless conversion experience.

---

## 🔧 Requirements

To run this project, ensure your environment has the following:

- **Node.js**
- **Docker**
- **PM2** (Install globally):  
  ```bash
  npm install -g pm2
  ```

---

## 📦 Installation

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## 🚀 How to Run the App

### Step 1: Start RabbitMQ and Redis Services via Docker
```bash
docker run -d --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
docker run -d --rm --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest
```

### Step 2: Start Backend Workers and Server
Navigate to the `backend` directory:
```bash
cd backend

# Start OCR, Translate, and PDF Workers (each with 4 instances)
pm2 start workers/ocrWorker.js -i 4
pm2 start workers/translateWorker.js -i 4
pm2 start workers/pdfWorker.js -i 4

# Optional: Check worker status
pm2 status

# Start backend server
node app.js
```

> If the server is running on **port 3001**, you're good to go! ✅

### Step 3: Start the Frontend
Navigate to the `frontend` directory:
```bash
cd frontend
npm run dev
```

> If the frontend is running on **port 3000**, the setup is complete! 🎉

---

## 🎉 Enjoy the App!

Feel free to explore the app and experience how it intelligently transforms English image content into professionally formatted Vietnamese PDF files.
