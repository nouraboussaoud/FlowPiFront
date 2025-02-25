import React, { useEffect, useState } from "react";
import Header from "../components/Header";

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

  // New function to handle toggling user status
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

  // Function to delete a user
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

        // Remove user from state
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Function to fetch user details
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

  // Function to open update modal with user data
  const handleOpenUpdateModal = (user) => {
    setUpdateFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  // Function to update user information
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

      // Update user in state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id ? { ...user, ...updateFormData } : user
        )
      );

      // Close modal
      setShowUpdateModal(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <>
      <title>Eduport- LMS, Education and Course Theme</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="author" content="Webestica.com" />
      <meta name="description" content="Eduport- LMS, Education and Course Theme" />
      <link rel="shortcut icon" href="assets/images/favicon.ico" />
      <link rel="preconnect" href="https://fonts.googleapis.com/" />
      <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" />
      <link rel="stylesheet" type="text/css" href="assets/vendor/font-awesome/css/all.min.css" />
      <link rel="stylesheet" type="text/css" href="assets/vendor/bootstrap-icons/bootstrap-icons.css" />
      <link rel="stylesheet" type="text/css" href="assets/vendor/aos/aos.css" />
      <link rel="stylesheet" type="text/css" href="assets/vendor/overlay-scrollbar/css/overlayscrollbars.min.css" />
      <link rel="stylesheet" type="text/css" href="assets/css/style.css" />
      <style>
        {`
          .ban-btn {
            background-color: red;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
          }
          .unban-btn {
            background-color: green;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
          }
          .action-btn {
            margin-right: 5px;
            margin-bottom: 5px;
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
            background-color: rgba(0,0,0,0.4);
          }
          .modal.show {
            display: block;
          }
          .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
            border-radius: 5px;
          }
          .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
          }
          .close:hover {
            color: black;
          }
            /* Add to your style section (around line 104) */
.btn-danger-soft {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
.btn-danger-soft:hover {
  background-color: rgba(220, 53, 69, 0.2);
}
        `}
      </style>
      <main>
        {/* Sidebar */}
        <nav className="sidebar navbar-dark bg-dark" style={{ width: "250px", height: "100vh", position: "fixed", left: 0, top: 0 }}>
          <div className="sidebar-header p-3">
            <h4 className="text-white">Eduport</h4>
          </div>
          <ul className="nav flex-column p-3">
          <li className="nav-item">
  <a className="nav-link text-white" href="/admin-dashboard">
    Dashboard
  </a>
</li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Users
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Settings
              </a>
            </li>
          </ul>
        </nav>

        {/* Page Content */}
        <div className="page-content" style={{ marginLeft: "250px" }}>
          {/* Top Bar */}
          <nav className="navbar top-bar navbar-light border-bottom py-0 py-xl-3">
            <div className="container-fluid">
              <span className="navbar-brand">Welcome, Admin</span>
              <div className="d-flex align-items-center">
                <i className="fas fa-bell me-3"></i>
                <img
                  src="https://via.placeholder.com/40"
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                />
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="page-content-wrapper border">
            <div className="row">
              <div className="col-12">
                <h1 className="h3 mb-2 mb-sm-0">Students</h1>
              </div>
            </div>
            <div className="card bg-transparent">
              <div className="card-header bg-transparent border-bottom px-0">
                <div className="row g-3 align-items-center justify-content-between">
                  <div className="col-md-8 d-flex align-items-center gap-3">
                    <form className="rounded position-relative flex-grow-1">
                      <input
                        className="form-control bg-transparent"
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
                        <i className="fas fa-search fs-6 " />
                      </button>
                    </form>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <ul
                      className="list-inline mb-0 nav nav-pills nav-pill-dark-soft border-0 justify-content-end"
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
              <div className="card-body px-0">
                <div className="tab-content">
                  <div className="tab-pane fade show active" id="nav-preview-tab-1">
                    <div className="row g-4">
                      {filteredUsers.map((user) => (
                        <div className="col-md-6 col-xxl-4" key={user._id}>
                          <div className="card bg-transparent border h-100">
                            <div className="card-header bg-transparent border-bottom d-flex justify-content-between">
                              <div className="d-sm-flex align-items-center">
                                <div className="avatar avatar-md flex-shrink-0">
                                  <img
                                    className="avatar-img rounded-circle"
                                    src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : "assets/images/avatar/01.jpg"}
                                    alt="avatar"
                                  />
                                </div>
                                <div className="ms-0 ms-sm-2 mt-2 mt-sm-0">
                                  <h5 className="mb-0">
                                    <a href="#">{user.name}</a>
                                  </h5>
                                  <span className="text-body small">
                                    {user.role}
                                  </span>
                                </div>
                              </div>
                              <div className="dropdown text-end">
                                <a
                                  href="#"
                                  className="btn btn-sm btn-light btn-round small mb-0"
                                  role="button"
                                  id="dropdownShare2"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <i className="bi bi-three-dots fa-fw" />
                                </a>
                                <ul
                                  className="dropdown-menu dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded"
                                  aria-labelledby="dropdownShare2"
                                >
                                  <li>
                                    <a className="dropdown-item" href="#" onClick={() => handleOpenUpdateModal(user)}>
                                      <i className="bi bi-pencil-square fa-fw me-2" />
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#" onClick={() => handleDeleteUser(user._id)}>
                                      <i className="bi bi-trash fa-fw me-2" />
                                      Delete
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
                           {/* Inside the card-footer section of the card view (around line 377) */}
<div className="card-footer bg-transparent border-top">
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
    <div className="text-end text-primary-hover">
      <button
        className={`btn ${user.isBanned ? 'ban-btn' : 'unban-btn'}`}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title={user.isBanned ? "Unban" : "Ban"}
        aria-label={user.isBanned ? "Unban" : "Ban"}
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
                    <div className="table-responsive border-0">
                      <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                        <thead>
                          <tr>
                            <th scope="col" className="border-0 rounded-start">
                              Name
                            </th>
                            <th scope="col" className="border-0">
                              Email
                            </th>
                            <th scope="col" className="border-0">
                              Role
                            </th>
                            <th scope="col" className="border-0">
                              Status
                            </th>
                            <th scope="col" className="border-0 rounded-end">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user._id}>
                              <td>
                                <div className="d-flex align-items-center position-relative">
                                  <div className="avatar avatar-md">
                                    <img
                                      src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : "assets/images/avatar/01.jpg"}
                                      className="rounded-circle"
                                      alt=""
                                    />
                                  </div>
                                  <div className="mb-0 ms-3">
                                    <h6 className="mb-0">
                                      <a href="#" className="stretched-link">
                                        {user.name}
                                      </a>
                                    </h6>
                                  </div>
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>{user.role}</td>
                              <td>{user.isActive ? "Active" : "Inactive"}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-light btn-round me-1 mb-1 mb-md-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="View Details"
                                  onClick={() => handleViewDetails(user._id)}
                                >
                                  <i className="bi bi-eye" />
                                </button>
                                <button
                                  className="btn btn-sm btn-light btn-round me-1 mb-1 mb-md-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Edit"
                                  onClick={() => handleOpenUpdateModal(user)}
                                >
                                  <i className="bi bi-pencil" />
                                </button>
                                <button
                                  className="btn btn-sm btn-light btn-round me-1 mb-1 mb-md-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Delete"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  <i className="bi bi-trash" />
                                </button>
                                <button
                                  className="btn btn-sm btn-light btn-round me-1 mb-1 mb-md-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title={user.isActive ? "Deactivate" : "Activate"}
                                  onClick={() => handleToggleStatus(user._id, user.isActive)}
                                >
                                  <i className={`bi bi-toggle-${user.isActive ? "on" : "off"}`} />
                                </button>
                                <button
                                  className={`btn ${user.isBanned ? 'ban-btn' : 'unban-btn'}`}
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title={user.isBanned ? "Unban" : "Ban"}
                                  aria-label={user.isBanned ? "Unban" : "Ban"}
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
              <div className="card-footer bg-transparent pt-0 px-0">
                <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
                  <p className="mb-0 text-center text-sm-start">
                    Showing 1 to 8 of {filteredUsers.length} entries
                  </p>
                  <nav
                    className="d-flex justify-content-center mb-0"
                    aria-label="navigation"
                  >
                    <ul className="pagination pagination-sm pagination-primary-soft mb-0 pb-0 px-0">
                      <li className="page-item mb-0">
                        <a className="page-link" href="#" tabIndex={-1}>
                          <i className="fas fa-angle-left" />
                        </a>
                      </li>
                      <li className="page-item mb-0">
                        <a className="page-link" href="#">
                          1
                        </a>
                      </li>
                      <li className="page-item mb-0 active">
                        <a className="page-link" href="#">
                          2
                        </a>
                      </li>
                      <li className="page-item mb-0">
                        <a className="page-link" href="#">
                          3
                        </a>
                      </li>
                      <li className="page-item mb-0">
                        <a className="page-link" href="#">
                          <i className="fas fa-angle-right" />
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        <div className={`modal ${showDetailsModal ? 'show' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowDetailsModal(false)}>&times;</span>
            <h2>User Details</h2>
            {selectedUser && (
              <div>
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={selectedUser.profilePic ? `http://localhost:5000/uploads/${selectedUser.profilePic}` : "assets/images/avatar/01.jpg"}
                    className="rounded-circle me-3"
                    alt="User Profile"
                    style={{ width: "60px", height: "60px" }}
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
            <span className="close" onClick={() => setShowUpdateModal(false)}>&times;</span>
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
                    onChange={(e) => setUpdateFormData({...updateFormData, name: e.target.value})}
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
                    onChange={(e) => setUpdateFormData({...updateFormData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    className="form-select"
                    id="role"
                    value={updateFormData.role}
                    onChange={(e) => setUpdateFormData({...updateFormData, role: e.target.value})}
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
      </main>
    </>
  );
};

export default UsersList;