export const uploadImageToImgBB = async (file) => {
  if (!file) return null;
  
  const imgData = new FormData();
  imgData.append('image', file);
  
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_IMGBB_API_KEY is not set in .env file.");
  }

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgData,
    });

    const jsonRes = await res.json();
    if (jsonRes.success) {
      return jsonRes.data.url;
    } else {
      throw new Error(jsonRes.error?.message || "Failed to upload to ImgBB");
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
