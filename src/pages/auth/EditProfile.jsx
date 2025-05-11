import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkillsManager from "../dashboard/SkillsManager";
import "./Edit.css";

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
  const [activeTab, setActiveTab] = useState("profile");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole") || "";
  const isStudent = userRole === "student";

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
        
        // Set role from user data or localStorage
        setRole(data.role || userRole || "");
        
        // Set profile picture with proper URL formatting
        if (data.profilePic) {
          const profilePicUrl = data.profilePic.startsWith('http') 
            ? data.profilePic 
            : `http://localhost:5000/uploads/profiles/${data.profilePic}`;
          setProfilePicture(profilePicUrl);
        } else {
          setProfilePicture("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchUserData();
  }, [token, userId, navigate, userRole]);

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
    
    // Remove all role validation since role is read-only for all users
    
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
      // Create a local URL for preview
      const localPreviewUrl = URL.createObjectURL(file);
      setProfilePicture(localPreviewUrl); // Preview
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
      
      // Always send the current role (which is read-only in the UI)
      formData.append("role", role);
      
      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      console.log("Updating user profile with data:", {
        name,
        email,
        role,
        hasProfilePictureFile: !!profilePictureFile
      });

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
      console.log("Update response:", result);
      
      // Update user in localStorage
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      updatedUser.name = name;
      updatedUser.email = email;
      updatedUser.role = role;
      
      // Update profile picture in localStorage
      if (result.user && result.user.profilePic) {
        updatedUser.profilePic = result.user.profilePic;
        localStorage.setItem("profilePic", result.user.profilePic);
        
        // Create a custom event to notify other components about the profile update
        const profileUpdateEvent = new CustomEvent('profileUpdated', {
          detail: {
            profilePic: result.user.profilePic
          }
        });
        window.dispatchEvent(profileUpdateEvent);
        
        console.log("Profile picture updated:", result.user.profilePic);
      }
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
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
    <>
      <Helmet>
      </Helmet>
      
      <div className="profile-page-container">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>
        
        <div className="profile-content">
          {/* Sidebar with profile picture and navigation */}
          <div className="profile-sidebar">
            {/* Profile picture section */}
            <div className="profile-picture-container">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="profile-picture"
                  onError={(e) => {
                    e.target.src = "/assets/images/avatar-placeholder.png";
                  }}
                />
              ) : (
                <div className="profile-picture-placeholder">
                  {name ? name[0].toUpperCase() : "U"}
                </div>
              )}
              
              <label htmlFor="profilePicture" className="change-photo-button">
                Change Photo
              </label>
              
              <input
                type="file"
                id="profilePicture"
                accept="image/jpeg,image/png"
                onChange={handleProfilePictureChange}
                className="file-input"
              />
            </div>
            
            <div className="profile-info">
              <div className="profile-name">{name || "Your Name"}</div>
              <div className="profile-role">{role || "Role"}</div>
              <div className="profile-email">{email || "email@example.com"}</div>
            </div>
            
            <div className="profile-tabs">
              <button 
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Personal Information
              </button>
              
              <button 
                className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Security
              </button>
              
              {isStudent && (
                <button 
                  className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setActiveTab('skills')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Skills
                </button>
              )}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="profile-main">
            {/* Personal Information Tab */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <h2>Personal Information</h2>
                <p className="tab-description">Update your personal details and profile information</p>
                
                <form onSubmit={handleUpdateUser} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: null }));
                      }}
                      placeholder="Enter your full name"
                      className={errors.name ? "error" : ""}
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: null }));
                      }}
                      placeholder="Enter your email address"
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                  
                  {/* Role field - displayed as read-only for all users */}
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <input
                      type="text"
                      id="role"
                      value={role}
                      className="form-control"
                      disabled
                    />
                    {errors.role && <div className="error-message">{errors.role}</div>}
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="save-button"
                      disabled={isLoadingProfile}
                    >
                      {isLoadingProfile ? (
                        <>
                          <span className="spinner"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="tab-pane">
                <h2>Security Settings</h2>
                <p className="tab-description">Manage your password and account security</p>
                
                <form className="profile-form">
                  <div className="form-group">
                    <label htmlFor="oldPassword">Current Password</label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => {
                        setOldPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, oldPassword: null }));
                      }}
                      placeholder="Enter your current password"
                      className={errors.oldPassword ? "error" : ""}
                    />
                    {errors.oldPassword && <div className="error-message">{errors.oldPassword}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, newPassword: null }));
                      }}
                      placeholder="Enter your new password"
                      className={errors.newPassword ? "error" : ""}
                    />
                    {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, confirmNewPassword: null }));
                      }}
                      placeholder="Confirm your new password"
                      className={errors.confirmNewPassword ? "error" : ""}
                    />
                    {errors.confirmNewPassword && <div className="error-message">{errors.confirmNewPassword}</div>}
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="save-button"
                      onClick={handleChangePassword}
                      disabled={isLoadingPassword}
                    >
                      {isLoadingPassword ? (
                        <>
                          <span className="spinner"></span>
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Skills Tab (only for students) */}
            {activeTab === 'skills' && isStudent && (
              <div className="tab-pane">
                <h2>My Skills</h2>
                <p className="tab-description">Manage your skills and competencies</p>
                <SkillsManager />
              </div>
            )}
          </div>
        </div>
        
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
      </div>
    </>
  );
};

export default EditProfile;
