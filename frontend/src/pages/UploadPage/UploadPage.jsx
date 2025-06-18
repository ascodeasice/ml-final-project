import React, { useState } from "react";
import { useLocation } from "wouter";
import { TrophySpin } from "react-loading-indicators";


const UploadPage = () => {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

    // Simulate image processing (replace with your real function)
  const generateImage = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Image processed");
        resolve();
      }, 3000); // simulate 3 sec process
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await generateImage(); // Replace with real API/upload
      navigate("/result");
    } catch (err) {
      console.error("Processing failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    textAlign: "center",
    padding: "20px",
  };

    const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const titleStyle = {
    fontSize: "2rem",
    marginBottom: "20px",
    fontWeight: "bold",
  };

  const boxStyle = {
    width: "300px",
    height: "300px",
    border: "2px dashed #ccc",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    backgroundColor: "#fff",
    cursor: "pointer",
    overflow: "hidden",
    position: "relative",
    color: "#999",
    fontSize: "1rem",
  };

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "2px solid white",
    borderRadius: "25px",
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "30px",
  };

  const checkboxContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  };

  const checkboxLabelStyle = {
    fontSize: "1rem",
    marginBottom: "8px",
  };

  const sectionTitleStyle = {
    fontWeight: "bold",
    marginBottom: "10px",
    fontSize: "1.2rem",
  };

  return (
    <div style={containerStyle}>
      {isLoading && (
        <div style={overlayStyle}>
          <TrophySpin color="#32cd32" size="large" text="Creating Your Vision..." textColor="#000" />
        </div>
      )}

      <h1 style={titleStyle}>Insert Your Image to Get Started</h1>
      <h2>Watch Your Creativity Take Shape</h2>

      <div style={boxStyle}>Click / Drag Your Image Here</div>

      <div style={checkboxContainerStyle}>
        <div style={sectionTitleStyle}>Choose Your Preferred Style!</div>

        <label style={checkboxLabelStyle}>
          <input type="checkbox" /> 3D Rendered Cartoon Style
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" /> Beauty Filter Style
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" /> Comic Style
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" /> All
        </label>
      </div>


      <button onClick={handleConfirm} style={buttonStyle} disabled={isLoading}>
        Confirm
      </button>
    </div>
  );
};

export default UploadPage;