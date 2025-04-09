import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardLayout = ({ children, title }) => {
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfilePic = localStorage.getItem("profilePic");
    console.log("📸 Image stockée dans localStorage:", storedProfilePic);

    if (storedProfilePic) {
      if (storedProfilePic.startsWith("http")) {
        setProfilePic(storedProfilePic); // Lien complet (Google)
      } else {
        setProfilePic(`http://localhost:5000/uploads/${storedProfilePic}`); // Image locale
      }
    }
  }, []);

  return (
    <main>
      {/* Sidebar */}
      <nav className="sidebar navbar-dark bg-dark" style={{ width: "250px", height: "100vh", position: "fixed", left: 0, top: 0 }}>
        <div className="sidebar-header p-3">
          <h4 className="text-white">FlowPi</h4>
        </div>
        <ul className="nav flex-column p-3">
          <li className="nav-item">
            <a className="nav-link text-white" href="/admin-dashboard">Dashboard</a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-white" href="/usersList">Users</a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-white" href="/groupList">Groups</a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-white" href="#">Settings</a>
          </li>
        </ul>
      </nav>

      {/* Page Content */}
      <div className="page-content" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <nav className="navbar top-bar navbar-light border-bottom py-0 py-xl-3">
          <div className="container-fluid">
            <span className="navbar-brand">{title}</span>
            <div className="d-flex align-items-center">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="User Profile"
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                  onError={(e) => {
                    console.warn("⚠️ Image introuvable :", profilePic);
                    e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
                  }}
                />
              ) : (
                <p>No Profile Picture</p>
              )}
            </div>
          </div>
        </nav>

        {/* Contenu dynamique */}
        <div className="page-content-wrapper border">
          {children}
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;
