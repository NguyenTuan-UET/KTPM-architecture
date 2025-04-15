export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.statusUrl) {
        return data; // Return statusUrl to be used in the next API call
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  