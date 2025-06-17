import React from "react";
import { Link, useLocation } from "wouter";

const ResultPage = () => {
  const [, navigate] = useLocation();

  return (
    <div>
      <h1>ResultPage</h1>
      {/* placeholder image */}
      <div>
        <img src="https://picsum.photos/200/300" />
        <div style={{ display: "flex" }}>
          <Link to="/edit">
            <button>Edit</button>
          </Link>
          <button>Download</button>
        </div>
        <label>Share Link: </label>
        <input readOnly value={"https://example.com"} />
        {/* maybe a copy button */}
      </div>

      <div>
        <img src="https://picsum.photos/200/300" />
        <div style={{ display: "flex" }}>
          <Link to="/edit">
            <button>Edit</button>
          </Link>
          <button>Download</button>
        </div>
        <label>Share Link: </label>
        <input readOnly value={"https://example.com"} />
      </div>
      <button onClick={() => navigate("/upload")}>Try again</button>
    </div>
  );
};

export default ResultPage;
