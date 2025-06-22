import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { TrophySpin } from "react-loading-indicators";
import { useResultImages, useUploadedImage } from "../../stores/imageStore";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
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
  // position: "relative",
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

const UploadPage = () => {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadedImage, setUploadedImage } = useUploadedImage();
  const { addResultImage } = useResultImages();
  const [previewUrl, setPreviewUrl] = useState(null);

  const [selectedStyles, setSelectedStyles] = useState({
    cartoon3D: false,
    beauty: false,
    comic: false,
    all: false,
  });

  const cropImageToSquare = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

          canvas.toBlob((blob) => {
            if (blob) {
              const croppedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve({
                file: croppedFile,
                preview: canvas.toDataURL(file.type),
              });
            } else {
              reject(new Error("無法轉換圖片為 Blob"));
            }
          }, file.type);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCheckboxChange = (style) => {
    if (style === "all") {
      const isAllChecked =
        selectedStyles.cartoon3D &&
        selectedStyles.beauty &&
        selectedStyles.comic;
      setSelectedStyles({
        cartoon3D: !isAllChecked,
        beauty: !isAllChecked,
        comic: !isAllChecked,
        all: !isAllChecked,
      });
    } else {
      const updated = {
        ...selectedStyles,
        [style]: !selectedStyles[style],
      };

      // 檢查是否所有選項都被選了
      const allSelected = updated.cartoon3D && updated.beauty && updated.comic;

      setSelectedStyles({
        ...updated,
        all: allSelected,
      });
    }
  };

  const handleConfirm = async () => {
    if (!uploadedImage) {
      alert("請先選擇一張圖片");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedImage); // 注意這裡名稱要和 FastAPI 接口的參數名一致

      // 將 selectedStyles 中為 true 的 key 收集起來
      const selected = Object.entries(selectedStyles)
        .filter(([key, value]) => key !== "all" && value)
        .map(([key]) => key);

      if (selected.length === 0) {
        alert("Please select at least one style");
        return;
      }

      selected.forEach((style) => formData.append("styles", style)); // 多個值同名 key

      // TODO: allow different url
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API 回傳錯誤");
      }

      const json = await response.json();
      json.results.forEach((base64) => {
        console.log(base64);
        addResultImage(base64);
      });

      navigate("/result");
    } catch (err) {
      console.error("處理失敗：", err);
      alert("圖片處理失敗，請再試一次");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const { file: croppedFile, preview } = await cropImageToSquare(file);
        setUploadedImage(croppedFile);
        setPreviewUrl(preview);
        console.log("裁切後的圖片檔案：", croppedFile);
      } catch (err) {
        console.error("圖片裁切失敗：", err);
        alert("圖片處理失敗");
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      try {
        const { file: croppedFile, preview } = await cropImageToSquare(file);
        setUploadedImage(croppedFile);
        setPreviewUrl(preview);
        console.log("裁切後的圖片檔案（拖曳）：", croppedFile);
      } catch (err) {
        console.error("圖片裁切失敗：", err);
        alert("圖片處理失敗");
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current.click(); // 手動觸發 input 點擊
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // 防止瀏覽器開啟圖片
  };

  return (
    <div style={containerStyle}>
      {isLoading && (
        <div style={overlayStyle}>
          <TrophySpin
            color="#32cd32"
            size="large"
            text="Creating Your Vision..."
            textColor="#000"
          />
        </div>
      )}

      <h1 style={titleStyle}>Insert Your Image to Get Started</h1>
      <h2>Watch Your Creativity Take Shape</h2>

      <div
        style={boxStyle}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="預覽圖片"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              border: "1px solid #ccc",
            }}
          />
        ) : (
          <p>Click / Drag Your Image Here</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }} // 隱藏按鈕
        />
      </div>

      <div style={checkboxContainerStyle}>
        <div style={sectionTitleStyle}>Choose Your Preferred Style!</div>

        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={selectedStyles.cartoon3D}
            onChange={() => handleCheckboxChange("cartoon3D")}
          />{" "}
          3D Rendered Cartoon Style
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={selectedStyles.beauty}
            onChange={() => handleCheckboxChange("beauty")}
          />{" "}
          Beauty Filter Style
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={selectedStyles.comic}
            onChange={() => handleCheckboxChange("comic")}
          />{" "}
          Comic Style
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={selectedStyles.all}
            onChange={() => handleCheckboxChange("all")}
          />{" "}
          All
        </label>
      </div>

      <button onClick={handleConfirm} style={buttonStyle} disabled={isLoading}>
        Confirm
      </button>
    </div>
  );
};

export default UploadPage;
