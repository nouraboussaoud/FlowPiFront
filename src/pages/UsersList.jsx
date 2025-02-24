import React, { useEffect, useState } from "react";
import Header from "../components/Header";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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
              <a className="nav-link text-white" href="#">
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
                                    <a className="dropdown-item" href="#">
                                      <i className="bi bi-pencil-square fa-fw me-2" />
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="bi bi-trash fa-fw me-2" />
                                      Remove
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
                            </div>
                            <div className="card-footer bg-transparent border-top">
                              <div className="d-sm-flex justify-content-between align-items-center">
                                <div className="text-end text-primary-hover">
                                  <a
                                    href="#"
                                    className="btn btn-link text-body p-0 mb-0 me-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title=""
                                    data-bs-original-title="Message"
                                    aria-label="Message"
                                  >
                                    <i className="bi bi-envelope-fill" />
                                  </a>
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
                              <td>
                                <a
                                  href="#"
                                  className="btn btn-light btn-round me-1 mb-1 mb-md-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="View"
                                >
                                  <i className="bi bi-eye" />
                                </a>
                                <a
                                  href="#"
                                  className="btn btn-light btn-round me-1 mb-1 mb-md-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Message"
                                >
                                  <i className="bi bi-envelope" />
                                </a>
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
      </main>
    </>
  );
};

export default UsersList;