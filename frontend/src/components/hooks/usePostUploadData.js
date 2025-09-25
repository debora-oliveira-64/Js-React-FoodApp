import { useState } from "react";

export const usePostUploadData = () => {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const addData = async (data) => {
    setLoading(true);

    try {
      const response = await fetch(`/images/upload`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        console.log("Error uploading image");
        return null;
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const getImage = async (imageName) => {
    setLoading(true);

    try {
      const response = await fetch(`/images/image/${imageName}`);

      if (response.ok) {
        const imageBlob = await response.blob(); 
        const imageUrl = URL.createObjectURL(imageBlob); 
        return imageUrl; 
      } else {
        console.log("Error retrieving image");
        return null;
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isError,
    isLoading,
    addData,
    getImage
  };
};
