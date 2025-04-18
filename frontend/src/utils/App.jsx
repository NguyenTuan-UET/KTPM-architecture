import React, { useState } from 'react';
import { uploadFile } from '../api/upload_api';
import { fetchStatus } from '../api/status_api';
import { downloadFile } from '../api/download_api';
import './App.css'; // Import CSS file for styling
import MonitorHealth from './MonitorHealth.jsx'; // Import MonitorHealth component

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // State for image preview
  const [translateText, setTranslateText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Handle file input change
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile)); // Set preview URL
  };

  // Upload file and convert
  const handleUpload = async () => {
    if (!file) return;

    try {
      const data = await uploadFile(file); // Call upload API
      if (data.statusUrl) {
        await fetchStatusData(data.statusUrl); // Call status API
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Fetch status from API
  const fetchStatusData = async (statusUrl) => {
    try {
      const data = await fetchStatus(statusUrl); // Call status API
      setTranslateText(data.translate_text);
      setDownloadUrl(data.downloadUrl);
      setIsReady(data.ready);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  // Download the file
  const handleDownload = async () => {
    if (downloadUrl) {
      await downloadFile(downloadUrl); // Call download API
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

        {isReady && <button onClick={handleDownload}>Download File</button>}
      </div>
    </div>
  );
};

export default FileUpload;
