import React from "react";
import { Link, useLocation } from "wouter";

const ResultPage = () => {
  const [, navigate] = useLocation();

  const images = [
    "https://picsum.photos/200/300?1",
    "https://picsum.photos/200/300?2",
    "https://picsum.photos/200/300?3",
  ];

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

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "30px" }}>Here Are The Results!</h1>

      {images.map((img, index) => (
        <div style={imageBlockStyle} key={index}>
          <img src={img} alt={`Generated ${index}`} style={resultImageStyle} />
          <div style={buttonRowStyle}>
            <Link to="/edit">
              <button style={resultButtonStyle}>Edit</button>
            </Link>
            <button style={resultButtonStyle}>Download</button>
          </div>
        </div>
      ))}

      <button style={tryAgainButtonStyle} onClick={() => navigate("/upload")}>
        Try Again
      </button>
    </div>
  );
};

export default ResultPage;
