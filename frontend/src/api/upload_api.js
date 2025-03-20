export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("http://localhost:3001/upload", {
            method: "POST",
            body: formData, // form có tên "image" chứa file ảnh
        });

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}