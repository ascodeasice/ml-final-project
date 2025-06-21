import React from "react";
import { Link, useParams } from "wouter";
import { useResultImages } from "../../stores/imageStore";

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
  borderRadius: "10px",
  marginBottom: "20px",
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
  const { id:imageIndex } = useParams();
  const { resultImages } = useResultImages()

  const imageBase64=resultImages[imageIndex]

  return (
    <div style={containerStyle}>
      <h1>Your Final Product</h1>
      <img
        src={`data:image/jpeg;base64,${imageBase64}`}
        alt="To Edit"
        style={imageStyle}
      />

      {/* Button Group */}
      <div>
        <button style={buttonStyle}>Save</button>
        <Link to="/result">
          <button style={buttonStyle}>Done</button>
        </Link>
      </div>
    </div>
  );
};

export default PreviewPage;
