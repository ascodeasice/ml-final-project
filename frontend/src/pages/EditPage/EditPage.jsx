import React from "react";
import { Link } from "wouter";

const EditPage = () => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
    textAlign: "center"
  };

  const imageStyle = {
    width: "200px",
    height: "300px",
    borderRadius: "10px",
    marginBottom: "20px",
    objectFit: "cover",
    border: "2px solid #ccc"
  };

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "25px",
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    margin: "10px"
  };

  return (
    <div style={containerStyle}>
      <h1>Edit Page</h1>
      <img src="https://picsum.photos/200/300" alt="To Edit" style={imageStyle} />

      {/* Button Group */}
      <div>
        <button style={buttonStyle}>Crop</button>
        <button style={buttonStyle}>Save</button>
        <Link to="/">
          <button style={buttonStyle}>Done</button>
        </Link>
      </div>
    </div>
  );
};

export default EditPage;
