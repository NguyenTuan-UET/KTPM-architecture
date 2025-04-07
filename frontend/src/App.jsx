import { useState } from 'react';
import { uploadFile } from './api/upload_api';
import './App.css';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setOriginalImage(URL.createObjectURL(selectedFile)); // Ảnh gốc sẽ được hiển thị ngay lập tức mà không cần tải lên server.
  };

  const checkStatus = async (userId) => {
    const intervalId = setInterval(async () => {
      const response = await fetch(`http://localhost:3001/status/${userId}`);
      const result = await response.json();

      if (result.ready) {
        setPdfUrl(`http://localhost:3001${result.downloadUrl}`);
        setStatusMessage("PDF đã sẵn sàng!");
        clearInterval(intervalId); 
      } else {
        setStatusMessage("Đang xử lý... Vui lòng chờ.");
      }
    }, 1000); 
  }

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMessage(null);

    // Gọi API upload ảnh
    const data = await uploadFile(file);
    if (data) {
      setUserId(data.userId); // Lưu userId nhận từ backend
      setStatusMessage("Đang tải lên... Vui lòng đợi.");
      checkStatus(data.userId); // Kiểm tra trạng thái sau khi upload
    }
    console.log(statusMessage);
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Upload & Convert File</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />

      <div className="button-container">
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="upload-button"
        >
          {loading ? 'Uploading...' : 'Upload & Convert'}
        </button>

        {statusMessage && <p className="status-message">{statusMessage}</p>}

        {pdfUrl && (
          <a href={pdfUrl} target='_blank' className="open-pdf-button">
            View PDF
          </a>
        )}
      </div>

      <div className="content">
        {originalImage && (
          <img src={originalImage} alt="Original" className="image" />
        )}
        {pdfUrl && (
          <iframe src={`${pdfUrl}?t=${new Date().getTime()}`} className="pdf-viewer"></iframe>
        )}
      </div>
    </div>
  );
}
