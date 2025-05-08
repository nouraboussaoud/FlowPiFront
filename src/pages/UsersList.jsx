import React, { useEffect, useState } from "react";
import DashboardLayout from './DashboardLayout';

const UsersList = () => {
  const [users, setUsers] = useState([]);
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
                        <div className="card h-100">
                          <div className="card-header d-flex justify-content-between">
                            <div className="d-sm-flex align-items-center">
                              <div className="avatar avatar-md flex-shrink-0">
                                <img
                                  className="avatar-img rounded-circle"
                                  src={
                                    user.profilePic
                                      ? user.profilePic.startsWith("http")
                                        ? user.profilePic
                                        : `http://localhost:5000/uploads/${user.profilePic}`
                                      : DEFAULT_PROFILE_PIC
                                  }
                                  alt="avatar"
                                  onError={(e) => (e.target.src = DEFAULT_PROFILE_PIC)}
                                />
                              </div>
                              <div className="ms-0 ms-sm-2 mt-2 mt-sm-0">
                                <h5 className="mb-0">{user.name}</h5>
                                <span className="text-body small">{user.role}</span>
                              </div>
                            </div>
                            <div className="dropdown text-end">
                              <a
                                href="#"
                                className="btn btn-sm btn-light btn-round small mb-0"
                                role="button"
                                id={`dropdown-${user._id}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="bi bi-three-dots fa-fw" />
                              </a>
                              <ul
                                className="dropdown-menu dropdown-menu-end"
                                aria-labelledby={`dropdown-${user._id}`}
                              >
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleOpenUpdateModal(user)}>
                                    <i className="bi bi-pencil-square fa-fw me-2" />Edit
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleDeleteUser(user._id)}>
                                    <i className="bi bi-trash fa-fw me-2" />Delete
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleToggleStatus(user._id, user.isActive)}>
                                    <i className="bi bi-toggle-on fa-fw me-2" />
                                    {user.isActive ? "Deactivate" : "Activate"}
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="icon-md bg-success bg-opacity-10 text-success rounded-circle flex-shrink-0">
                                  <i className="bi bi-envelope fa-fw" />
                                </div>
                                <h6 className="mb-0 ms-2 fw-light">Email</h6>
                              </div>
                              <span className="mb-0 fw-bold">{user.email}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="icon-md bg-purple bg-opacity-10 text-purple rounded-circle flex-shrink-0">
                                  <i className="fas fa-user fa-fw" />
                                </div>
                                <h6 className="mb-0 ms-2 fw-light">Role</h6>
                              </div>
                              <span className="mb-0 fw-bold">{user.role}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="icon-md bg-info bg-opacity-10 text-info rounded-circle flex-shrink-0">
                                  <i className="fas fa-toggle-on fa-fw" />
                                </div>
                                <h6 className="mb-0 ms-2 fw-light">Status</h6>
                              </div>
                              <span className="mb-0 fw-bold">{user.isActive ? "Active" : "Inactive"}</span>
                            </div>
                          </div>
                          <div className="card-footer border-top">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <button
                                  className="btn btn-sm btn-primary-soft action-btn"
                                  onClick={() => handleViewDetails(user._id)}
                                >
                                  <i className="bi bi-eye me-1"></i>Details
                                </button>
                                <button
                                  className="btn btn-sm btn-danger-soft action-btn"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  <i className="bi bi-trash me-1"></i>Delete
                                </button>
                              </div>
                              <div className="text-end">
                                <button
                                  className={`btn btn-sm ${user.isBanned ? 'btn-success' : 'btn-danger'}`}
                                  onClick={() => handleBanUnban(user._id, user.isBanned)}
                                >
                                  {user.isBanned ? "Unban" : "Ban"}
                                </button>
                              </div>
                            </div>
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
                                          : `http://localhost:5000/uploads/${user.profilePic}`
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
                <nav aria-label="navigation">
                  <ul className="pagination pagination-sm pagination-primary-soft mb-0">
                    <li className="page-item">
                      <a
                        className="page-link"
                        href="#"
                        onClick={() => paginate(currentPage - 1)}
                      >
                        <i className="fas fa-angle-left" />
                      </a>
                    </li>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <a
                          className="page-link"
                          href="#"
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </a>
                      </li>
                    ))}
                    <li className="page-item">
                      <a
                        className="page-link"
                        href="#"
                        onClick={() => paginate(currentPage + 1)}
                      >
                        <i className="fas fa-angle-right" />
                      </a>
                    </li>
                  </ul>
                </nav>
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
                          : `http://localhost:5000/uploads/${selectedUser.profilePic}`
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
