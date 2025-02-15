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
      fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const accessToken = data.access_token;
          fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
            .then((response) => response.json())
            .then((user) => {
              localStorage.setItem("user", JSON.stringify(user));
              navigate("/loggedInHome");
            });
        });
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default GithubCallback;