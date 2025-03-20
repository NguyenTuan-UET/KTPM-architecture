import { useState } from 'react';
import { uploadFile } from './api/upload_api';
import './App.css';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setOriginalImage(URL.createObjectURL(selectedFile)); // Ảnh gốc sẽ được hiển thị ngay lập tức mà không cần tải lên server.
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const data = await uploadFile(file); // Gọi API upload ảnh
    if (data) {
      setPdfUrl(`http://localhost:3001${data.pdfUrl}`);
    }

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