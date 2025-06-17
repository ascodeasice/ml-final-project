import React from "react";
import { Link } from "wouter";

const TitlePage = () => {
  return (
    <div>
      <h1>Style Gen</h1>
      <Link href="/upload">
        <button>Start Generating</button>
      </Link>
    </div>
  );
};

export default TitlePage;
