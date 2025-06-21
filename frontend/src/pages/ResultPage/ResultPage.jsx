import React from "react";
import { Link, useLocation } from "wouter";
import { useResultImages } from "../../stores/imageStore";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
};

const imageBlockStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "30px",
  backgroundColor: "white",
  width: "300px",
};

const resultImageStyle = {
  width: "200px",
  height: "auto",
  borderRadius: "10px",
  marginBottom: "15px",
  border: "2px solid #ccc",
};

const buttonRowStyle = {
  display: "flex",
  gap: "15px",
  marginBottom: "10px",
};

const resultButtonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "25px",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const tryAgainButtonStyle = {
  marginTop: "20px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  padding: "10px 20px",
  fontSize: "1rem",
  borderRadius: "25px",
  cursor: "pointer",
};

const ResultPage = () => {
  const [, navigate] = useLocation();
  const { resultImages, clearResultImages } = useResultImages();

  const downloadBase64Image = (base64String, filename = "download.jpg") => {
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${base64String}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onClickTryAgain = () => {
    clearResultImages();
    navigate("/upload");
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "30px" }}>Here Are The Results!</h1>

      {resultImages.map((base64, index) => (
        <div style={imageBlockStyle} key={index}>
          <img
            src={`data:image/jpeg;base64,${base64}`}
            alt={`Generated ${index}`}
            style={resultImageStyle}
          />
          <div style={buttonRowStyle}>
            <Link to={`/preview/${index}`}>
              <button style={resultButtonStyle}>Preview</button>
            </Link>
            <button
              style={resultButtonStyle}
              onClick={() => downloadBase64Image(base64, `image_${index}.jpg`)}
            >
              Download
            </button>
          </div>
        </div>
      ))}

      <button style={tryAgainButtonStyle} onClick={onClickTryAgain}>
        Try Again
      </button>
    </div>
  );
};

export default ResultPage;
