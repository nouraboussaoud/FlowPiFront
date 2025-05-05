import { useEffect, useState, memo } from "react";
import axios from "axios";
import { debounce } from "lodash";
import ChatBox from "./chatbox/ChatBox";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23d3d3d3'/%3E%3C/svg%3E";

const ChatBoxPortal = ({ user, onClose }) => {
  return createPortal(
    <div className="chat-bubble-container">
      <ChatBox user={user} onClose={onClose} />
    </div>,
    document.body
  );
};

const ModalPortal = ({ children, onClose }) => {
  return createPortal(
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const UsersTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [updateModalUser, setUpdateModalUser] = useState(null);
  const [detailsModalUser, setDetailsModalUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login.");

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), 10000)
        );
        const axiosPromise = axios.get("http://localhost:5000/api/users/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await Promise.race([axiosPromise, timeoutPromise]);
        const studentUsers = response.data.filter((user) => user.role === "student");
        setStudents(studentUsers);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (chatUser) {
      const scrollPosition = window.scrollY;
      console.log("Chat opened, saving scroll position:", scrollPosition);
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = "100%";
      const blockScroll = (e) => e.preventDefault();
      window.addEventListener("scroll", blockScroll);
      return () => {
        const top = parseInt(document.body.style.top || "0") * -1;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.removeEventListener("scroll", blockScroll);
        console.log("Chat closed, restoring scroll position:", top);
        window.scrollTo(0, top);
      };
    }
  }, [chatUser]);

  const handleViewDetails = (user) => {
    console.log("Viewing details for user:", user._id);
    setDetailsModalUser(user);
  };

  const handleOpenUpdateModal = (user) => {
    console.log("Editing user:", user);
    setUpdateModalUser({ ...user });
  };

  const handleChatClick = (student, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Opening chat for user:", student._id);
    setChatUser(student);
  };

  const debouncedDeleteUser = debounce(async (userId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    console.log("Deleting user:", userId);
    setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(students.filter((student) => student._id !== userId));
      if (paginatedStudents.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      setError(error.response?.data?.message || "Error deleting student");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: false }));
    }
  }, 300);

  const debouncedToggleStatus = debounce(async (userId, isActive) => {
    console.log("Toggling status for user:", userId, "Current isActive:", isActive);
    setActionLoading((prev) => ({ ...prev, [`toggle-${userId}`]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/toggle-status/${userId}`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(
        students.map((student) =>
          student._id === userId
            ? { ...student, isActive: response.data.user.isActive }
            : student
        )
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      setError(error.response?.data?.message || "Error toggling status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`toggle-${userId}`]: false }));
    }
  }, 300);

  const debouncedBanUnban = debounce(async (userId, isBanned) => {
    console.log("Banning/Unbanning user:", userId, "Current isBanned:", isBanned);
    setActionLoading((prev) => ({ ...prev, [`ban-${userId}`]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/ban-user/${userId}`,
        { action: isBanned ? "unban" : "ban" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(
        students.map((student) =>
          student._id === userId ? { ...student, isBanned: !isBanned } : student
        )
      );
    } catch (error) {
      console.error("Error banning/unbanning student:", error);
      setError(error.response?.data?.message || "Error banning/unbanning student");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`ban-${userId}`]: false }));
    }
  }, 300);

  const dismissError = () => setError(null);

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
    e.target.onError = null;
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/update/${updateModalUser._id}`,
        {
          name: updateModalUser.name,
          email: updateModalUser.email,
          role: updateModalUser.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(
        students.map((s) =>
          s._id === updateModalUser._id ? response.data.user : s
        )
      );
      setUpdateModalUser(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error updating user");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  const StudentRow = memo(({ student }) => (
    <tr>
      <td data-label="Name">
        <div className="d-flex align-items-center">
          <img
            src={
              student.profilePic
                ? `http://localhost:5000/uploads/${student.profilePic}`
                : PLACEHOLDER_IMAGE
            }
            className="rounded-circle me-2"
            alt={`${student.name}'s avatar`}
            width="40"
            height="40"
            onError={handleImageError}
          />
          <span
            className="text-primary cursor-pointer"
            onClick={() => handleViewDetails(student)}
          >
            {student.name}
          </span>
        </div>
      </td>
      <td data-label="Email" className="email-column">
        {student.email || "N/A"}
      </td>
      <td data-label="Role" className="text-capitalize">
        {student.role}
      </td>
      <td data-label="Status">
        <span className={`badge ${student.isActive ? "bg-success" : "bg-danger"}`}>
          {student.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td data-label="Actions">
        <div className="btn-group" role="group">
          <button
            className="btn btn-outline-primary btn-sm"
            title="View Details"
            onClick={() => handleViewDetails(student)}
            aria-label={`View details for ${student.name}`}
            disabled={actionLoading[`view-${student._id}`]}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            className="btn btn-outline-warning btn-sm"
            title="Edit"
            onClick={() => handleOpenUpdateModal(student)}
            aria-label={`Edit ${student.name}`}
            disabled={actionLoading[`edit-${student._id}`]}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            title="Delete"
            onClick={() => debouncedDeleteUser(student._id)}
            aria-label={`Delete ${student.name}`}
            disabled={actionLoading[`delete-${student._id}`]}
          >
            {actionLoading[`delete-${student._id}`] ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className="bi bi-trash"></i>
            )}
          </button>
          <button
            className="btn btn-outline-info btn-sm"
            title={student.isActive ? "Deactivate" : "Activate"}
            onClick={() => debouncedToggleStatus(student._id, student.isActive)}
            aria-label={`${student.isActive ? "Deactivate" : "Activate"} ${student.name}`}
            disabled={actionLoading[`toggle-${student._id}`]}
          >
            {actionLoading[`toggle-${student._id}`] ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className={`bi bi-toggle-${student.isActive ? "on" : "off"}`}></i>
            )}
          </button>
          <button
            className="btn btn-outline-success btn-sm"
            title="Chat"
            onClick={(e) => handleChatClick(student, e)}
            aria-label={`Chat with ${student.name}`}
            disabled={actionLoading[`chat-${student._id}`]}
          >
            <i className="bi bi-chat-dots"></i>
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            title={student.isBanned ? "Unban" : "Ban"}
            onClick={() => debouncedBanUnban(student._id, student.isBanned)}
            aria-label={`${student.isBanned ? "Unban" : "Ban"} ${student.name}`}
            disabled={actionLoading[`ban-${student._id}`]}
          >
            {actionLoading[`ban-${student._id}`] ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className={`bi ${student.isBanned ? "bi-check-circle" : "bi-ban"}`}></i>
            )}
          </button>
        </div>
      </td>
    </tr>
  ));

  return (
    <div className="container my-2">
      <h2 className="mb-3 text-2xl font-bold text-dark">Student List</h2>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={dismissError}
            aria-label="Close"
          ></button>
        </div>
      )}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p className="loading-text">Please wait, we're loading student data...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="card text-center p-4">
          <i className="bi bi-person-x display-4 text-muted mb-2"></i>
          <p className="text-muted">No students found.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col" className="email-column">
                    Email
                  </th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <StudentRow key={student._id} student={student} />
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous"
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
      {chatUser && <ChatBoxPortal user={chatUser} onClose={() => setChatUser(null)} />}
      {updateModalUser && (
        <ModalPortal onClose={() => setUpdateModalUser(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit User</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setUpdateModalUser(null)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={updateModalUser.name}
                    onChange={(e) =>
                      setUpdateModalUser({ ...updateModalUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={updateModalUser.email}
                    onChange={(e) =>
                      setUpdateModalUser({ ...updateModalUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    value={updateModalUser.role}
                    onChange={(e) =>
                      setUpdateModalUser({ ...updateModalUser, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setUpdateModalUser(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateUser}
              >
                Save changes
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
      {detailsModalUser && (
        <ModalPortal onClose={() => setDetailsModalUser(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">User Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setDetailsModalUser(null)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Name</label>
                <p>{detailsModalUser.name}</p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <p>{detailsModalUser.email || "N/A"}</p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Role</label>
                <p className="text-capitalize">{detailsModalUser.role}</p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Status</label>
                <p>
                  <span
                    className={`badge ${
                      detailsModalUser.isActive ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {detailsModalUser.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Ban Status</label>
                <p>
                  <span
                    className={`badge ${
                      detailsModalUser.isBanned ? "bg-danger" : "bg-success"
                    }`}
                  >
                    {detailsModalUser.isBanned ? "Banned" : "Not Banned"}
                  </span>
                </p>
              </div>
              {detailsModalUser.profilePic && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Profile Picture</label>
                  <div>
                    <img
                      src={`http://localhost:5000/uploads/${detailsModalUser.profilePic}`}
                      className="rounded-circle"
                      alt={`${detailsModalUser.name}'s avatar`}
                      width="80"
                      height="80"
                      onError={handleImageError}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetailsModalUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
      <style jsx>{`
        .container {
          max-width: 1200px;
          contain: content;
        }

        .table {
          background-color: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          width: 100%;
          table-layout: fixed;
        }

        .table th,
        .table td {
          padding: 12px;
          vertical-align: middle;
          min-height: 60px;
        }

        .table th {
          font-weight: 600;
          color: #343a40;
          position: sticky;
          top: 0;
          z-index: 1;
          background: #f8f9fa;
        }

        .table td {
          color: #495057;
        }

        .email-column {
          width: 30%;
          word-break: break-word;
        }

        .rounded-circle {
          border-radius: 50% !important;
          object-fit: cover;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background-color: #d3d3d3;
        }

        .cursor-pointer {
          cursor: pointer;
          text-decoration: underline;
        }

        .btn-group {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .btn-group .btn {
          transition: background-color 0.2s ease, border-color 0.2s ease;
          min-width: 32px;
          padding: 4px 8px;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
          display: inline-block;
          min-width: 60px;
          text-align: center;
        }

        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          width: 100%;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin Wtop: 10px;
          color: #495057;
          font-size: 1rem;
        }

        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        .chat-bubble-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          width: 300px;
        }

        .pagination .page-link {
          cursor: pointer;
        }

        .pagination .page-item.active .page-link {
          background-color: #007bff;
          border-color: #007bff;
        }

        .pagination .page-item.disabled .page-link {
          cursor: not-allowed;
          opacity: 0.6;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 767.98px) {
          .table-responsive {
            overflow-x: hidden;
          }

          .table {
            display: block;
            width: 100%;
          }

          .table thead {
            display: none;
          }

          .table tbody,
          .table tr {
            display: block;
          }

          .table tr {
            margin-bottom: 1rem;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            contain: content;
          }

          .table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border: none;
            position: relative;
            font-size: 0.9rem;
            min-height: 50px;
          }

          .table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #343a40;
            width: 40%;
            flex-shrink: 0;
          }

          .table td[data-label="Name"] {
            font-weight: 500;
          }

          .table td[data-label="Email"] {
            word-break: break-word;
          }

          .table td[data-label="Actions"] {
            flex-wrap: wrap;
            gap: 8px;
          }

          .table td[data-label="Actions"]::before {
            display: none;
          }

          .btn-group {
            gap: 4px;
          }

          .btn {
            font-size: 0.8rem;
            padding: 6px 10px;
          }

          .rounded-circle {
            width: 32px;
            height: 32px;
          }

          h2 {
            font-size: 1.5rem;
          }

          .loading-text {
            font-size: 0.9rem;
          }

          .chat-bubble-container {
            bottom: 15px;
            right: 15px;
            width: 90%;
            max-width: 280px;
          }

          .modal-dialog {
            margin: 1rem;
            max-width: 95%;
          }

          .modal-content {
            font-size: 0.9rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-header,
          .modal-footer {
            padding: 0.75rem 1rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .form-label {
            font-size: 0.9rem;
          }

          .badge {
            font-size: 0.7rem;
          }

          .pagination {
            font-size: 0.9rem;
          }

          .page-link {
            padding: 0.5rem 0.75rem;
          }
        }

        .modal {
          z-index: 1050;
        }

        .modal-content {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }

        .modal-footer {
          border-top: 1px solid #dee2e6;
        }

        .form-control,
        .form-select {
          border-radius: 4px;
        }

        .modal-body p {
          margin: 0;
          color: #495057;
        }

        .modal-body .badge {
          font-size: 0.85rem;
        }

        @media (min-width: 768px) {
          .modal-dialog {
            max-width: 500px;
          }
        }
      `}</style>
    </div>
  );
};

export default UsersTable;