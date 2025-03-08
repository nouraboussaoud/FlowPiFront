import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LayoutStudent from "../dashboard/LayoutStudent";

const EditProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setFullName(data.username);
        setEmail(data.email);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/update-password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ensure token is stored in localStorage
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Password updated successfully!");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Server error, please try again later.");
    }
  };

  return (
    <LayoutStudent>
      <div className="card bg-transparent border rounded-3">
        <div className="card-header bg-transparent border-bottom">
          <h3 className="card-header-title mb-0">Edit Profile</h3>
        </div>
        <div className="card-body">
          <form className="row g-4">
            <div className="col-12">
              <label className="form-label">Full name</label>
              <input type="text" className="form-control" value={fullName} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} readOnly />
            </div>

            <div className="card border bg-transparent rounded-3">
              <div className="card-header bg-transparent border-bottom">
                <h5 className="card-header-title mb-0">Update Password</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Current password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Enter new password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Confirm new password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <button type="button" className="btn btn-primary" onClick={handleChangePassword}>
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LayoutStudent>
  );
};

export default EditProfile;
