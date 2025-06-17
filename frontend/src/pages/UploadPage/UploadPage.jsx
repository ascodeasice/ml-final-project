import React from "react";
import { useLocation } from "wouter";

const UploadPage = () => {
  const [, navigate] = useLocation();
  // TODO: fake function, replace with real api
  const generateImage = () => {
    console.log("generating image...");
    navigate("/select");
  };

  return (
    <div>
      <h1>UploadPage</h1>
      <button onClick={generateImage}>Confirm</button>
    </div>
  );
};

export default UploadPage;
