import img1 from "../../assets/original_3D_cartoon.png";
import img2 from "../../assets/generated_3D_cartoon.png";
import img3 from "../../assets/original_beauty.jpg";
import img4 from "../../assets/generated_beauty.jpg";
import img5 from "../../assets/original_comic.jpg";
import img6 from "../../assets/generated_comic.jpg";

import React from "react";
import { Link } from "wouter";

// // Temporary placeholder image
// const placeholderImg = "https://via.placeholder.com/200";

const TitlePage = () => {
  const outerContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  };

  const topSectionStyle = {
    textAlign: "center",
    marginBottom: "40px",
  };

  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "2px solid white",
    borderRadius: "25px",
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "10px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 60px 1fr",
    rowGap: "40px",
    alignItems: "center",
  };

  const imageStyle = {
    width: "200px",
    height: "auto",
    // borderRadius: "8px",
    // border: "3px solid #ccc",
    padding: "10px 50px",  // vertical 10px, horizontal 15px
    alignItems: "center",
  };

  const arrowStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "1rem",   // increased from 0.9rem
    color: "#555",
  };

  const arrowSymbol = "➡️"; // or use an SVG later

  const columnTitlesStyle = {
    display: "flex",
    justifyContent: "space-between",
    width: "460px", // 2 images + space in between
    marginBottom: "20px",
    fontWeight: "bold",
    alignItems: "center",
  };

  return (
    <div style={outerContainerStyle}>
      {/* Title & Button */}
      <div style={topSectionStyle}>
        <h1>Welcome to StyleGen</h1>
        <h2>From Vision to Reality - We Create What You Imagine</h2>
        <Link href="/upload">
          <button style={buttonStyle}>Start Generating</button>
        </Link>
      </div>

      {/* Column Headers */}
      <div style={columnTitlesStyle}>
        <span>Original Image</span>
        <span>Output Image</span>
      </div>

      {/* 3 Rows of Image Pairs */}
      <div style={gridStyle}>
        {/* Row 1 */}
        <img src={img1} alt="original1" style={imageStyle} />
        <div style={arrowStyle}>
          <span style={{ fontSize: "1rem", fontWeight: "bold" }}>3D Rendered Cartoon Style</span>
          <span style={{ fontSize: "3rem" }}>{arrowSymbol}</span> 
        </div>
        <img src={img2} alt="output" style={imageStyle} />

        {/* Row 2 */}
        <img src={img3} alt="original" style={imageStyle} />
        <div style={arrowStyle}>
          <span style={{ fontSize: "1rem", fontWeight: "bold" }}>Beauty Filter Style</span>
          <span style={{ fontSize: "3rem" }}>{arrowSymbol}</span>
        </div>
        <img src={img4} alt="output" style={imageStyle} />

        {/* Row 3 */} 
        <img src={img5} alt="original" style={imageStyle} />
         <div style={arrowStyle}>
          <span style={{ fontSize: "1rem", fontWeight: "bold" }}>Comic Style</span>
          <span style={{ fontSize: "3rem" }}>{arrowSymbol}</span>
        </div>
        <img src={img6} alt="output" style={imageStyle} />
      </div>
    </div>
  );
};

export default TitlePage;
