import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Call the backend logout API to inform the server
    const logoutUser = async () => {
      try {
        // Send the POST request to the backend
        const response = await fetch("http://localhost:5000/api/users/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,  // Send the JWT token
            "Content-Type": "application/json"
          },
        });

        const data = await response.json();

        if (response.ok) {
          // If the server responds with success, remove token and role from localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("role");

          // Redirect to the login page
          navigate("/login");
        } else {
          alert(data.message || "Logout failed!");
        }
      } catch (error) {
        console.error("Error logging out:", error);
        alert("Something went wrong during logout!");
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div>
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
