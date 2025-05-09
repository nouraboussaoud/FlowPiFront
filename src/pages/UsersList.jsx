import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';
import { motion } from 'framer-motion';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  
  // Button styles that will be used throughout the component
  const buttonStyles = {
    button: {
      padding: "0.625rem 1rem",
      borderRadius: "6px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    primary: {
      backgroundColor: "#3b82f6",
      color: "white",
    },
    danger: {
      backgroundColor: "#ef4444",
      color: "white",
    },
    success: {
      backgroundColor: "#10b981",
      color: "white",
    },
    info: {
      backgroundColor: "#6b7280",
      color: "white",
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    email: "",
    role: ""
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // Default profile picture
  const DEFAULT_PROFILE_PIC = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/users/getAll", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleBanUnban = async (userId, isCurrentlyBanned) => {
    try {
      const token = localStorage.getItem("token");
      const action = isCurrentlyBanned ? "unban" : "ban";
      const response = await fetch(`http://localhost:5000/api/users/ban-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ban status");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isBanned: !isCurrentlyBanned } : user
        )
      );
    } catch (error) {
      console.error("Error updating ban status:", error);
    }
  };

  const handleToggleStatus = async (userId, isCurrentlyActive) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/toggle-status/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error("Failed to toggle user status");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isActive: !isCurrentlyActive } : user
        )
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await response.json();
      setSelectedUser(userData);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleOpenUpdateModal = (user) => {
    setUpdateFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/update/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id ? { ...user, ...updateFormData } : user
        )
      );

      setShowUpdateModal(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <DashboardLayout title="Users List">
      <div className="page-content-wrapper">
        <div className="users-section">
          <h2 className="section-title">Users</h2>
          <div className="card">
            <div className="card-header border-bottom">
              <div className="row g-3 align-items-center justify-content-between">
                <div className="col-md-8 d-flex align-items-center gap-3">
                  <form className="rounded position-relative flex-grow-1">
                    <input
                      className="form-control"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                      type="submit"
                    >
                      <i className="fas fa-search fs-6" />
                    </button>
                  </form>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <ul
                    className="list-inline mb-0 nav nav-pills border-0 justify-content-end"
                    id="pills-tab"
                    role="tablist"
                  >
                    <li className="nav-item">
                      <a
                        href="#nav-preview-tab-1"
                        className="nav-link mb-0 me-2 active"
                        data-bs-toggle="tab"
                      >
                        <i className="fas fa-fw fa-th-large" />
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        href="#nav-html-tab-1"
                        className="nav-link mb-0"
                        data-bs-toggle="tab"
                      >
                        <i className="fas fa-fw fa-list-ul" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="tab-content">
                <div className="tab-pane fade show active" id="nav-preview-tab-1">
                  <div className="row g-4">
                    {currentUsers.map((user) => (
                      <div className="col-md-6 col-xxl-4" key={user._id}>
                        <div className="user-card">
                          <div className="user-card-header">
                            <div className="user-profile">
                              <div className="user-avatar-wrapper">
                                <img
                                  src={
                                    user.profilePic
                                      ? user.profilePic.startsWith("http")
                                        ? user.profilePic
                                        : `http://localhost:5000/uploads/profiles/${user.profilePic}`
                                      : DEFAULT_PROFILE_PIC
                                  }
                                  alt={user.name}
                                  onError={(e) => (e.target.src = DEFAULT_PROFILE_PIC)}
                                  className="user-avatar-img"
                                />
                                <span className={`status-dot ${user.isActive ? "active" : "inactive"}`}></span>
                              </div>
                              <div className="user-identity">
                                <h5 className="user-name" style={{ color: "#1e40af" }}>{user.name}</h5>
                                <span className="user-badge">{user.role}</span>
                              </div>
                            </div>
                            <div className="card-actions">
                              <button
                                className="card-action-btn"
                                id={`dropdown-${user._id}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="bi bi-three-dots-vertical"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdown-${user._id}`}>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleOpenUpdateModal(user)}>
                                    <i className="bi bi-pencil-square fa-fw me-2"></i>Edit
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleDeleteUser(user._id)}>
                                    <i className="bi bi-trash fa-fw me-2"></i>Delete
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleToggleStatus(user._id, user.isActive)}>
                                    <i className="bi bi-toggle-on fa-fw me-2"></i>
                                    {user.isActive ? "Deactivate" : "Activate"}
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div className="user-card-body">
                            <div className="user-detail-item">
                              <div className="detail-icon">
                                <i className="bi bi-envelope"></i>
                              </div>
                              <div className="detail-content">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{user.email}</span>
                              </div>
                            </div>
                            <div className="user-detail-item">
                              <div className="detail-icon">
                                <i className="bi bi-person-badge"></i>
                              </div>
                              <div className="detail-content">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{user.role}</span>
                              </div>
                            </div>
                            <div className="user-detail-item">
                              <div className="detail-icon">
                                <i className="bi bi-shield-check"></i>
                              </div>
                              <div className="detail-content">
                                <span className="detail-label">Status</span>
                                <span className={`detail-value ${user.isActive ? "text-success" : "text-danger"}`}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="user-card-footer">
                            <button
                              className="btn-action view"
                              onClick={() => handleViewDetails(user._id)}
                            >
                              <i className="bi bi-eye"></i>
                              <span>Details</span>
                            </button>
                            <button
                              className="btn-action edit"
                              onClick={() => handleOpenUpdateModal(user)}
                            >
                              <i className="bi bi-pencil"></i>
                              <span>Edit</span>
                            </button>
                            <button
                              className={`btn-action ${user.isBanned ? "unban" : "ban"}`}
                              onClick={() => handleBanUnban(user._id, user.isBanned)}
                            >
                              <i className={`bi bi-${user.isBanned ? "unlock" : "lock"}`}></i>
                              <span>{user.isBanned ? "Unban" : "Ban"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="tab-pane fade" id="nav-html-tab-1">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0 table-hover">
                      <thead>
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Role</th>
                          <th scope="col">Status</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div className="d-flex align-items-center position-relative">
                                <div className="avatar avatar-md">
                                  <img
                                    src={
                                      user.profilePic
                                        ? user.profilePic.startsWith("http")
                                          ? user.profilePic
                                          : `http://localhost:5000/uploads/profiles/${user.profilePic}`
                                        : DEFAULT_PROFILE_PIC
                                    }
                                    className="rounded-circle"
                                    alt=""
                                    onError={(e) => (e.target.src = DEFAULT_PROFILE_PIC)}
                                  />
                                </div>
                                <div className="mb-0 ms-3">
                                  <h6 className="mb-0">{user.name}</h6>
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.isActive ? "Active" : "Inactive"}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-light btn-round me-1"
                                onClick={() => handleViewDetails(user._id)}
                              >
                                <i className="bi bi-eye" />
                              </button>
                              <button
                                className="btn btn-sm btn-light btn-round me-1"
                                onClick={() => handleOpenUpdateModal(user)}
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button
                                className="btn btn-sm btn-light btn-round me-1"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <i className="bi bi-trash" />
                              </button>
                              <button
                                className="btn btn-sm btn-light btn-round me-1"
                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                              >
                                <i className={`bi bi-toggle-${user.isActive ? "on" : "off"}`} />
                              </button>
                              <button
                                className={`btn btn-sm ${user.isBanned ? 'btn-success' : 'btn-danger'}`}
                                onClick={() => handleBanUnban(user._id, user.isBanned)}
                              >
                                {user.isBanned ? "Unban" : "Ban"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer pt-0">
              <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
                <p className="mb-0">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
                </p>
                <div className="pagination">
                  <motion.button
                    className="pagination-button"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Previous
                  </motion.button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <motion.button
                        key={index + 1}
                        className={`pagination-page ${currentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => paginate(index + 1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {index + 1}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    className="pagination-button"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        <div className={`modal ${showDetailsModal ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowDetailsModal(false)}>×</span>
            <h2>User Details</h2>
            {selectedUser && (
              <div>
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={
                      selectedUser.profilePic
                        ? selectedUser.profilePic.startsWith("http")
                          ? selectedUser.profilePic
                          : `http://localhost:5000/uploads/profiles/${selectedUser.profilePic}`
                        : DEFAULT_PROFILE_PIC
                    }
                    className="rounded-circle me-3"
                    alt="User Profile"
                    style={{ width: "60px", height: "60px" }}
                    onError={(e) => (e.target.src = DEFAULT_PROFILE_PIC)}
                  />
                  <div>
                    <h3 className="mb-0">{selectedUser.name}</h3>
                    <p className="mb-0">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p><strong>Status:</strong> {selectedUser.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p><strong>Ban Status:</strong> {selectedUser.isBanned ? "Banned" : "Not Banned"}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button className="btn btn-secondary me-2" onClick={() => setShowDetailsModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenUpdateModal(selectedUser);
                  }}>Edit User</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Update User Modal */}
        <div className={`modal ${showUpdateModal ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowUpdateModal(false)}>×</span>
            <h2>Update User</h2>
            {selectedUser && (
              <form onSubmit={handleUpdateUser}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={updateFormData.name}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={updateFormData.email}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    className="form-select"
                    id="role"
                    value={updateFormData.role}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, role: e.target.value })}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button type="button" className="btn btn-secondary me-2" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update User</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-content-wrapper {
          padding: 2rem;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1.5rem;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--primary-color);
          border-radius: 2px;
        }

        .card {
          background-color: var(--content-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 4px 6px var(--shadow-color);
        }

        .card-header {
          background-color: var(--content-bg);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem 1.5rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        .card-footer {
          background-color: var(--content-bg);
          border-top: 1px solid var(--border-color);
          padding: 1rem 1.5rem;
        }

        .form-control, .form-select {
          background-color: var(--content-bg);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .form-control:focus, .form-select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
        }

        .btn-primary {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }

        .btn-primary:hover {
          background-color: var(--primary-dark);
          border-color: var(--primary-dark);
        }

        .btn-secondary {
          background-color: var(--text-light);
          border-color: var(--text-light);
          color: var(--content-bg);
        }

        .btn-primary-soft {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--primary-color);
          border: none;
        }

        .btn-primary-soft:hover {
          background-color: rgba(59, 130, 246, 0.2);
        }

        .btn-danger {
          background-color: var(--danger);
          border-color: var(--danger);
          color: white;
        }

        .btn-danger:hover {
          background-color: #dc2626;
          border-color: #dc2626;
        }

        .btn-danger-soft {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: none;
        }

        .btn-danger-soft:hover {
          background-color: rgba(239, 68, 68, 0.2);
        }

        .btn-success {
          background-color: #10b981;
          border-color: #10b981;
          color: white;
        }

        .btn-success:hover {
          background-color: #059669;
          border-color: #059669;
        }

        .table {
          background-color: var(--content-bg);
          color: var(--text-color);
        }

        .table th, .table td {
          border: 1px solid var(--border-color);
        }

        .table-hover tbody tr:hover {
          background-color: var(--bg-color);
        }

        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.4);
        }

        .modal.show {
          display: block;
        }

        .modal-content {
          background-color: var(--content-bg);
          color: var(--text-color);
          margin: 15% auto;
          padding: 20px;
          border: 1px solid var(--border-color);
          width: 80%;
          max-width: 600px;
          border-radius: 12px;
          box-shadow: 0 4px 6px var(--shadow-color);
        }

        .close {
          color: var(--text-light);
          float: right;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
        }

        .close:hover {
          color: var(--text-color);
        }

        .avatar-img {
          width: 40px;
          height: 40px;
          object-fit: cover;
        }

        .icon-md {
          width: 32px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          font-size: 16px;
        }

        .action-btn {
          margin-right: 5px;
          margin-bottom: 5px;
        }

        .dropdown-menu {
          background-color: var(--content-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 6px var(--shadow-color);
        }

        .dropdown-item {
          color: var(--text-color);
        }

        .dropdown-item:hover {
          background-color: var(--bg-color);
          color: var(--primary-color);
        }

        .pagination-primary-soft .page-link {
          color: var(--primary-color);
          background-color: var(--content-bg);
          border: 1px solid var(--border-color);
        }

        .pagination-primary-soft .page-item.active .page-link {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .user-card {
          background-color: #f8fafc; /* Very light blue-gray */
          border-radius: 16px;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .user-card-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.05) 100%);
        }

        .user-card-body {
          padding: 16px;
          flex-grow: 1;
          background-color: #ffffff;
        }

        .user-card-footer {
          padding: 16px;
          display: flex;
          gap: 8px;
          border-top: 1px solid rgba(59, 130, 246, 0.1);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(59, 130, 246, 0.08) 100%);
        }

        /* For dark mode compatibility */
        [data-bs-theme="dark"] .user-card {
          background-color: #1e293b; /* Dark blue-gray */
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        [data-bs-theme="dark"] .user-card-header {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%);
        }

        [data-bs-theme="dark"] .user-card-body {
          background-color: #0f172a; /* Darker blue-gray */
        }

        [data-bs-theme="dark"] .user-card-footer {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.15) 100%);
        }

        .user-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.15);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-avatar-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
        }

        .status-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .status-dot.active {
          background-color: #10b981;
        }

        .status-dot.inactive {
          background-color: #ef4444;
        }

        .user-identity {
          display: flex;
          flex-direction: column;
          background-color: rgba(59, 130, 246, 0.1);
          padding: 8px 12px;
          border-radius: 8px;
          min-width: 150px;
        }

        .user-name {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e40af; /* Same color as the role badge */
          line-height: 1.2;
        }

        /* For dark mode compatibility */
        [data-bs-theme="dark"] .user-name {
          color: #93c5fd; /* Same light blue as the role badge in dark mode */
        }

        .user-badge {
          display: inline-block;
          margin-top: 5px;
          padding: 3px 8px;
          background-color: rgba(59, 130, 246, 0.2);
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* For dark mode compatibility */
        [data-bs-theme="dark"] .user-identity {
          background-color: rgba(59, 130, 246, 0.2);
        }

        [data-bs-theme="dark"] .user-badge {
          background-color: rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }

        .card-actions {
          align-self: flex-start;
        }

        .card-action-btn {
          background: transparent;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          transition: all 0.2s ease;
        }

        .card-action-btn:hover {
          background-color: rgba(59, 130, 246, 0.1);
          transform: rotate(90deg);
        }

        .user-card-body {
          padding: 16px;
          flex-grow: 1;
        }

        .user-detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px dashed var(--border-color);
        }

        .user-detail-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .detail-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: var(--bg-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: var(--primary-color);
        }

        .detail-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--primary-color);
          opacity: 0.7;
          margin-bottom: 3px;
        }

        .detail-value {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-color);
          word-break: break-word;
        }

        .user-card-footer {
          padding: 16px;
          display: flex;
          gap: 8px;
          border-top: 1px solid var(--border-color);
        }

        .btn-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 8px;
          border: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-action.view {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--primary-color);
        }

        .btn-action.view:hover {
          background-color: var(--primary-color);
          color: white;
        }

        .btn-action.edit {
          background-color: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .btn-action.edit:hover {
          background-color: #f59e0b;
          color: white;
        }

        .btn-action.ban {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .btn-action.ban:hover {
          background-color: #ef4444;
          color: white;
        }

        .btn-action.unban {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .btn-action.unban:hover {
          background-color: #10b981;
          color: white;
        }

        .text-success {
          color: #10b981 !important;
        }

        .text-danger {
          color: #ef4444 !important;
        }

        @media (max-width: 767.98px) {
          .page-content-wrapper {
            padding: 1rem;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default UsersList;
