import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import Cropper from "react-easy-crop";
import { TrophySpin } from "react-loading-indicators";
import getCroppedImg from "./cropUtils"; // utility we define below

const UploadPage = () => {
  const [, navigate] = useLocation();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const showCroppedImage = async () => {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(cropped);
    } catch (e) {
      console.error("Crop failed", e);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    navigate("/result");
    setIsLoading(false);
  };

  const containerStyle = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f5f5f5", padding: "20px", textAlign: "center" };
  const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(255, 255, 255, 0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={containerStyle}>
      {isLoading && (
        <div style={overlayStyle}>
          <TrophySpin color="#32cd32" size="large" text="Creating Your Vision..." textColor="#000" />
        </div>
      )}

      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Insert Your Image to Get Started</h1>
      <h2>Watch Your Creativity Take Shape</h2>

      {!imageSrc && (
        <label style={{ margin: "20px", cursor: "pointer", padding: "20px", border: "2px dashed #ccc", borderRadius: "10px", backgroundColor: "#fff" }}>
          Click to Upload JPG/PNG
          <input type="file" accept=".jpg,.png" style={{ display: "none" }} onChange={handleImageChange} />
        </label>
      )}

      {imageSrc && !croppedImage && (
        <div style={{ position: "relative", width: "300px", height: "300px" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <button onClick={showCroppedImage} style={{ marginTop: "20px" }}>Crop</button>
        </div>
      )}

      {croppedImage && (
        <div style={{ marginTop: "20px" }}>
          <img src={croppedImage} alt="cropped" style={{ width: "300px", height: "300px", objectFit: "cover", borderRadius: "10px", border: "1px solid #ccc" }} />
        </div>
      )}

      {croppedImage && (
        <button onClick={handleConfirm} style={{ marginTop: "30px", backgroundColor: "#007bff", color: "white", border: "2px solid white", borderRadius: "25px", padding: "10px 20px", fontSize: "1rem", cursor: "pointer" }}>
          Confirm
        </button>
      )}
    </div>
  );
};

export default UploadPage;
