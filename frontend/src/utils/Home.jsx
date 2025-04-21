import React, { useState, useEffect } from 'react';
import { uploadFile } from '../api/upload_api';
import { circuitBreaker, getCircuitState } from '../api/circuitBreaker'; // 🆕 import getCircuitState
import { downloadFile } from '../api/download_api';
import './Home.css';

const Home = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [translateText, setTranslateText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [countdown, setCountdown] = useState(null); // 🆕

  // Đếm ngược nếu circuitBreaker đang OPEN
  useEffect(() => {
    const interval = setInterval(() => {
      const { state, openedAt, RESET_TIMEOUT } = getCircuitState();
      if (state === 'OPEN' && openedAt) {
        const timeLeft = Math.max(0, RESET_TIMEOUT - (Date.now() - openedAt));
        setCountdown(Math.ceil(timeLeft / 1000));
      } else {
        setCountdown(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const data = await uploadFile(file);
      if (data.statusUrl) {
        fetchStatusData(data.statusUrl);
      }
    } catch (error) {
      console.error('❌ Lỗi upload:', error);
    }
  };

  const fetchStatusData = (statusUrl) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await circuitBreaker(() =>
          fetch(`http://localhost:3001/status/${statusUrl}`, { method: 'GET' })
        );
        const result = await response.json();

        if (result.ready) {
          console.log(result);
          setTranslateText(result.translate_text);
          setStatusMessage('✅ PDF sẵn sàng tải về!');
          setDownloadUrl(result.downloadUrl);
          setIsReady(true);
          clearInterval(intervalId);
        } else {
          setIsReady(false);
          setStatusMessage('⏳ Đang xử lý... Vui lòng chờ.');
        }
      } catch (error) {
        console.warn('⚠️ Lỗi khi gọi API:', error.message);
      }
    }, 1000);
  };

  const handleDownload = async () => {
    if (downloadUrl) {
      console.log('Tải file từ:', downloadUrl);
      setStatusMessage('🔄️ Đang tải file');
      await downloadFile(downloadUrl);
    }
  };

  return (
    <div>
      <div className="file-upload-container">
        <h1>Upload & Convert Image</h1>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file}>
          Upload & Convert
        </button>

        {filePreview && (
          <div className="content">
            <img src={filePreview} alt="Uploaded Preview" className="image" />
            {translateText && (
              <div className="translation">
                <h3>Translated Text:</h3>
                <p>{translateText}</p>
              </div>
            )}
          </div>
        )}

        {statusMessage && <p className="status-message">{statusMessage}</p>}

        {isReady && <button onClick={handleDownload}>Download File</button>}

        {/* Hiển thị countdown nếu circuitBreaker đang OPEN */}
        {countdown > 0 &&  (
          <p className="status-message warning">
            🚨 Chờ xíu. Vui lòng chờ {countdown} giây...
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
