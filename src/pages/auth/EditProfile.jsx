import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LayoutStudent from "../dashboard/LayoutStudent";
import SkillsManager from "../dashboard/SkillsManager";
import "../tasks/Tasks.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !userId) {
        console.warn("No token or userId found. Redirecting to login.");
        toast.error("Please log in to view your profile.", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          console.warn("Unauthorized. Redirecting to login.");
          localStorage.clear();
          toast.error("Session expired. Please log in again.", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setRole(data.role || "");
        setProfilePicture(data.profilePicture || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchUserData();
  }, [token, userId, navigate]);

  const validateProfile = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!role) {
      newErrors.role = "Role is required.";
    } else if (!["student", "tutor"].includes(role)) {
      newErrors.role = "Role must be student or tutor.";
    }
    if (profilePictureFile) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(profilePictureFile.type)) {
        newErrors.profilePicture = "Only JPEG or PNG images are allowed.";
      } else if (profilePictureFile.size > 5 * 1024 * 1024) {
        newErrors.profilePicture = "Image must be less than 5MB.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!oldPassword) {
      newErrors.oldPassword = "Current password is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
      newErrors.newPassword =
        "Password must include uppercase, lowercase, and a number.";
    }
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file)); // Preview
      setErrors((prev) => ({ ...prev, profilePicture: null }));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!validateProfile()) {
      toast.error("Please fix the errors in the profile form.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("role", role);
      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const response = await fetch(`http://localhost:5000/api/users/update/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to update user");
      }

      const result = await response.json();
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      updatedUser.name = name;
      updatedUser.email = email;
      updatedUser.role = role;
      updatedUser.profilePicture = result.user.profilePicture || profilePicture;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfilePictureFile(null); // Clear file input
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Server error, please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      toast.error("Please fix the errors in the password form.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoadingPassword(true);
    console.log(`Password update attempt for userId: ${userId}`, {
      timestamp: new Date().toISOString(),
      oldPasswordLength: oldPassword.length,
      newPasswordLength: newPassword.length,
    });

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/update-password/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        console.log(`Password update successful for userId: ${userId}`, {
          timestamp: new Date().toISOString(),
        });
        toast.success("Password updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setErrors({});
      } else {
        console.log(`Password update failed for userId: ${userId}`, {
          timestamp: new Date().toISOString(),
          error: result.message,
        });
        toast.error(result.message || "Failed to update password.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error(`Password update error for userId: ${userId}`, {
        timestamp: new Date().toISOString(),
        error: error.message,
      });
      toast.error("Server error, please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <LayoutStudent>
      
        <title>Edit Profile</title>
   
      <div className="container">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Edit Profile</h3>
          </div>
          <form onSubmit={handleUpdateUser}>
            <div className="avatar-container">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  {name ? name[0].toUpperCase() : "U"}
                </div>
              )}
              <input
                type="file"
                id="profilePicture"
                accept="image/jpeg,image/png"
                onChange={handleProfilePictureChange}
                className="file-input"
                aria-describedby={errors.profilePicture ? "profilePictureError" : undefined}
              />
              {errors.profilePicture && (
                <span id="profilePictureError" className="input-error">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#dc2626"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.profilePicture}
                </span>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="name">
                  Name
                </label>
                <input
                  className={`input ${errors.name ? "border-red-500" : ""}`}
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  required
                  aria-required="true"
                  placeholder="Enter name"
                  aria-describedby={errors.name ? "nameError" : undefined}
                />
                {errors.name && (
                  <span id="nameError" className="input-error">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#dc2626"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    </svg>
                    {errors.name}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  className={`input ${errors.email ? "border-red-500" : ""}`}
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  required
                  aria-required="true"
                  placeholder="Enter email address"
                  aria-describedby={errors.email ? "emailError" : undefined}
                />
                {errors.email && (
                  <span id="emailError" className="input-error">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#dc2626"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    </svg>
                    {errors.email}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="label" htmlFor="role">
                  Role
                </label>
                <select
                  className={`input ${errors.role ? "border-red-500" : ""}`}
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrors((prev) => ({ ...prev, role: null }));
                  }}
                  required
                  aria-required="true"
                  aria-describedby={errors.role ? "roleError" : undefined}
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
                {errors.role && (
                  <span id="roleError" className="input-error">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#dc2626"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    </svg>
                    {errors.role}
                  </span>
                )}
              </div>
            </div>
            <div className="button-group">
              <button
                className="button-primary"
                type="submit"
                disabled={isLoadingProfile}
                aria-label="Save profile"
              >
                {isLoadingProfile ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-card mt-6">
          <div className="profile-card-header">
            <h5 className="profile-card-title">Update Password</h5>
          </div>
          <div className="p-6">
            <div className="form-group">
              <label className="label" htmlFor="oldPassword">
                Current Password
              </label>
              <input
                className={`input ${errors.oldPassword ? "border-red-500" : ""}`}
                type="password"
                id="oldPassword"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, oldPassword: null }));
                }}
                required
                aria-required="true"
                aria-describedby={
                  errors.oldPassword ? "oldPasswordError" : undefined
                }
              />
              {errors.oldPassword && (
                <span id="oldPasswordError" className="input-error">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#dc2626"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.oldPassword}
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="label" htmlFor="newPassword">
                New Password
              </label>
              <input
                className={`input ${errors.newPassword ? "border-red-500" : ""}`}
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: null }));
                }}
                required
                aria-required="true"
                aria-describedby={
                  errors.newPassword ? "newPasswordError" : undefined
                }
              />
              {errors.newPassword && (
                <span id="newPasswordError" className="input-error">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#dc2626"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.newPassword}
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="label" htmlFor="confirmNewPassword">
                Confirm New Password
              </label>
              <input
                className={`input ${
                  errors.confirmNewPassword ? "border-red-500" : ""
                }`}
                type="password"
                id="confirmNewPassword"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmNewPassword: null }));
                }}
                required
                aria-required="true"
                aria-describedby={
                  errors.confirmNewPassword ? "confirmNewPasswordError" : undefined
                }
              />
              {errors.confirmNewPassword && (
                <span id="confirmNewPasswordError" className="input-error">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#dc2626"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.confirmNewPassword}
                </span>
              )}
            </div>
            <div className="button-group">
              <button
                className="button-primary"
                type="button"
                onClick={handleChangePassword}
                disabled={isLoadingPassword}
                aria-label="Change password"
              >
                {isLoadingPassword ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>

        <SkillsManager />
      </div>
    </LayoutStudent>
  );
};

export default EditProfile;