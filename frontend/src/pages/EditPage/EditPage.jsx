import React from "react";
import { Link } from "wouter";

const EditPage = () => {
  return (
    <div>
      <h1>EditPage</h1>
      <img src="https://picsum.photos/200/300" />
      <Link to="/result">
        <button>Confirm</button>
      </Link>
    </div>
  );
};

export default EditPage;
