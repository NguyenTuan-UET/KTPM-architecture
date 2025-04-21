import { circuitBreaker } from './circuitBreaker';

export const downloadFile = async (downloadUrl) => {
  try {
    const response = await circuitBreaker(() =>
      fetch(`http://localhost:3001/download/${downloadUrl}`, {
        method: 'GET',
      })
    );

    if (response.ok) {
      const blob = await response.blob(); // Lấy dữ liệu dưới dạng Blob (để tải file)
      const link = document.createElement('a'); // Tạo thẻ <a> để tải file
      const url = window.URL.createObjectURL(blob); // Tạo URL từ Blob
      link.href = url; // Liên kết tới Blob
      link.download = downloadUrl.split('/').pop(); // Đặt tên file dựa trên URL
      link.click(); // Bắt sự kiện click để tải file
      window.URL.revokeObjectURL(url); // Hủy URL sau khi tải xong
    } else {
      throw new Error('Download failed');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
