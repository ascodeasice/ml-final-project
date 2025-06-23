import React from "react";
import { Link, useParams } from "wouter";
import { useResultImages, useUploadedImage } from "../../stores/imageStore";
import { ImgComparisonSlider } from "@img-comparison-slider/react";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backgroundColor: "#f5f5f5",
  padding: "20px",
  textAlign: "center",
};

const imageStyle = {
  width: "300px",
  height: "300px",
  objectFit: "cover",
  border: "2px solid #ccc",
};

const buttonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "25px",
  padding: "10px 20px",
  fontSize: "1rem",
  cursor: "pointer",
  margin: "10px",
};

const PreviewPage = () => {
  const { id: imageIndex } = useParams();
  const { resultImages } = useResultImages();
  const { uploadedImage } = useUploadedImage();

  const imageBase64 = resultImages[imageIndex];
  const imageUrl = URL.createObjectURL(uploadedImage); // 建立臨時的圖片網址

  return (
    <div style={containerStyle}>
      <h1>Your Final Product</h1>
      <ImgComparisonSlider>
        <img slot="first" src={imageUrl} style={imageStyle} />
        <img
          slot="second"
          src={`data:image/jpeg;base64,${imageBase64}`}
          style={imageStyle}
        />
      </ImgComparisonSlider>

      {/* Button Group */}
      <div>
        <Link to="/result">
          <button style={buttonStyle}>Done</button>
        </Link>
      </div>
    </div>
  );
};

export default PreviewPage;
