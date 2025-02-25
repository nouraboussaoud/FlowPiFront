import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GithubCallback = () => {
  const navigate = useNavigate();
  const CLIENT_ID = "Ov23liDt1cBCD2aFlRUl";
  const CLIENT_SECRET = "2ad00340fbdf8edd63477de3997214ac5fc3c230"; // Replace with your GitHub client secret

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
  
    if (code) {
      fetch("http://localhost:5000/github/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("User data:", data);
          // Save user data to localStorage or context
        })
        .catch((error) => console.error("Error:", error));
    }
  }, []);
  
  return <div>Loading...</div>;
};

export default GithubCallback;