import React from "react";

const Loader = () => {
  return <span className="loader"></span>;
};

export default Loader;

const loaderStyle = {
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  display: "block",
  position: "relative",
  background: "#fff",
  boxShadow: "-24px 0 #fff, 24px 0 #fff",
  boxSizing: "border-box",
  animation: "shadowPulse 2s linear infinite"
};

const style = document.createElement("style");
style.innerHTML = `
  @keyframes shadowPulse {
    33% {
      background: #fff;
      box-shadow: -24px 0 #ff3d00, 24px 0 #fff;
    }
    66% {
      background: #ff3d00;
      box-shadow: -24px 0 #fff, 24px 0 #fff;
    }
    100% {
      background: #fff;
      box-shadow: -24px 0 #fff, 24px 0 #ff3d00;
    }
  }
  .loader {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: block;
    position: relative;
    background: #fff;
    box-shadow: -24px 0 #fff, 24px 0 #fff;
    box-sizing: border-box;
    animation: shadowPulse 2s linear infinite;
  }
`;
document.head.appendChild(style);
