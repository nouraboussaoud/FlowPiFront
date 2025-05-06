import React, { useState, useEffect, useRef, memo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import ChatBox from "./chatbox/ChatBox";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import "./messageslist/MessagesList.css";

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
    <AnimatePresence>
      <motion.div
        className="modal fade show d-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 1050,
        }}
        onClick={onClose}
      >
        <motion.div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

const UsersTable = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [updateModalUser, setUpdateModalUser] = useState(null);
  const [detailsModalUser, setDetailsModalUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [unreadMessages, setUnreadMessages] = useState({});
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch only student users (role === "student")
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
        setFilteredStudents(studentUsers);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    // Fetch initial unread message counts for students who sent messages to the tutor
    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const counts = {};

        const response = await axios.get(
          "http://localhost:5000/api/messages/unread-counts-by-sender",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const unreadCounts = response.data.counts;

        students.forEach((student) => {
          counts[student._id] = unreadCounts[student._id] || 0;
        });

        setUnreadMessages(counts);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch unread messages");
      }
    };

    if (students.length > 0) {
      fetchUnreadMessages();
    }
  }, [students]);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    // Initialize socket connection with proper authentication
    socketRef.current = io("http://localhost:5000", {
      auth: { token }, // Pass token in auth object
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });

    // Handle connection
    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully for real-time notifications");
      
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const tutorId = decoded._id || decoded.userId; // Check both formats
        socketRef.current.emit('join', tutorId);
        console.log("Joined room:", tutorId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    });

    // Handle new messages
    socketRef.current.on("new_message", (message) => {
      console.log("New message received via socket:", message);
      
      // Make sure we have the necessary data
      const senderId = message.sender?._id || message.sender;
      const senderRole = message.sender?.role || "unknown";
      
      // Only update for student messages and if not currently chatting with this student
      if (senderId !== chatUser?._id && senderRole === "student") {
        setUnreadMessages(prev => {
          const newCounts = { ...prev };
          newCounts[senderId] = (newCounts[senderId] || 0) + 1;
          console.log("Updated unread counts:", newCounts);
          return newCounts;
        });
        
        // Show toast notification
        toast.info(`New message from ${message.sender?.name || "Student"}`, {
          position: "top-right",
          autoClose: 3000
        });
      }
    });

    // Handle connection errors with more detailed logging
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      console.error("Error details:", err);
    });

    // Clean up on unmount
    return () => {
      console.log("Disconnecting socket");
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatUser]);

  useEffect(() => {
    if (chatUser) {
      const scrollPosition = window.scrollY;
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
        window.scrollTo(0, top);
      };
    }
  }, [chatUser]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(lowerQuery) ||
          (student.email && student.email.toLowerCase().includes(lowerQuery))
      );
      setFilteredStudents(filtered);
      setCurrentPage(1);
    }, 300);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchQuery, students]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredStudents(students);
    setCurrentPage(1);
  };

  const handleViewDetails = (student) => {
    setDetailsModalUser(student);
  };

  const handleOpenUpdateModal = (student) => {
    setUpdateModalUser({ ...student });
  };

  const handleChatClick = async (user, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      // Mark all messages from this student as read
      await axios.put(
        `http://localhost:5000/api/messages/mark-all-read/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadMessages((prev) => ({ ...prev, [user._id]: 0 }));
      setChatUser(user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark messages as read");
    }
  };

  const debouncedDeleteUser = debounce(async (userId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(students.filter((student) => student._id !== userId));
      setFilteredStudents(filteredStudents.filter((student) => student._id !== userId));
      setUnreadMessages((prev) => {
        const newCounts = { ...prev };
        delete newCounts[userId];
        return newCounts;
      });
      if (paginatedStudents.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error deleting student");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: false }));
    }
  }, 300);

  const debouncedToggleStatus = debounce(async (userId, isActive) => {
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
      setFilteredStudents(
        filteredStudents.map((student) =>
          student._id === userId
            ? { ...student, isActive: response.data.user.isActive }
            : student
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Error toggling status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`toggle-${userId}`]: false }));
    }
  }, 300);

  const debouncedBanUnban = debounce(async (userId, isBanned) => {
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
      setFilteredStudents(
        filteredStudents.map((student) =>
          student._id === userId ? { ...student, isBanned: !isBanned } : student
        )
      );
    } catch (error) {
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
        students.map((u) =>
          u._id === updateModalUser._id ? response.data.user : u
        )
      );
      setFilteredStudents(
        filteredStudents.map((u) =>
          u._id === updateModalUser._id ? response.data.user : u
        )
      );
      setUpdateModalUser(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error updating student");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfMax = Math.floor(maxPagesToShow / 2);
      if (currentPage <= halfMax) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + halfMax >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfMax;
        endPage = currentPage + halfMax;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 1) {
      pages.unshift("...");
      pages.unshift(1);
    }
    if (endPage < totalPages) {
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

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
          <motion.button
            className="btn btn-outline-primary btn-sm"
            title="View Details"
            onClick={() => handleViewDetails(student)}
            aria-label={`View details for ${student.name}`}
            disabled={actionLoading[`view-${student._id}`]}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-eye"></i>
          </motion.button>
          <motion.button
            className="btn btn-outline-warning btn-sm"
            title="Edit"
            onClick={() => handleOpenUpdateModal(student)}
            aria-label={`Edit ${student.name}`}
            disabled={actionLoading[`edit-${student._id}`]}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-pencil"></i>
          </motion.button>
          <motion.button
            className="btn btn-outline-danger btn-sm"
            title="Delete"
            onClick={() => debouncedDeleteUser(student._id)}
            aria-label={`Delete ${student.name}`}
            disabled={actionLoading[`delete-${student._id}`]}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLoading[`delete-${student._id}`] ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className="bi bi-trash"></i>
            )}
          </motion.button>
          <motion.button
            className="btn btn-outline-info btn-sm"
            title={student.isActive ? "Deactivate" : "Activate"}
            onClick={() => debouncedToggleStatus(student._id, student.isActive)}
            aria-label={`${student.isActive ? "Deactivate" : "Activate"} ${student.name}`}
            disabled={actionLoading[`toggle-${student._id}`]}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLoading[`toggle-${student._id}`] ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className={`bi bi-toggle-${student.isActive ? "on" : "off"}`}></i>
            )}
          </motion.button>
          <motion.button
            className="btn btn-outline-success btn-sm"
            title="Chat"
            onClick={(e) => handleChatClick(student, e)}
            aria-label={`Chat with ${student.name}`}
            disabled={actionLoading[`chat-${student._id}`]}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-chat-dots"></i>
            {unreadMessages[student._id] > 0 && (
              <div style={{
                display: "inline-block",
                marginLeft: "5px",
                backgroundColor: "#dc3545",
                color: "white",
                borderRadius: "4px",
                padding: "0 4px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                lineHeight: "1.2",
                verticalAlign: "text-top"
              }}>
                {unreadMessages[student._id]}
              </div>
            )}
          </motion.button>
          <motion.button
            className="btn btn-outline-secondary btn-sm"
            title={student.isBanned ? "Unban" : "Ban"}
            onClick={() => debouncedBanUnban(student._id, student.isBanned)}
            aria-label={`${student.isBanned ? "Unban" : "Ban"} ${student.name}`}
            disabled={actionLoading[`ban-${student._id}`]}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLoading[`ban-${student._id}`] ? (
              <i className="bi bi-arrow-repeat spin"></i>
            ) : (
              <i className={`bi ${student.isBanned ? "bi-check-circle" : "bi-ban"}`}></i>
            )}
          </motion.button>
        </div>
      </td>
    </tr>
  ));

  return (
    <div className="container my-4">
      <motion.h2
        className="mb-4 text-3xl font-bold text-dark"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
      </motion.h2>
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search students"
          />
          {searchQuery && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>
      {error && (
        <motion.div
          className="alert alert-danger alert-dismissible fade show mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={dismissError}
            aria-label="Close"
          ></button>
        </motion.div>
      )}
      {loading ? (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="spinner"></div>
          <p className="loading-text">Loading student data...</p>
        </motion.div>
      ) : filteredStudents.length === 0 ? (
        <motion.div
          className="card text-center p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="bi bi-person-x display-4 text-muted mb-2"></i>
          <p className="text-muted">
            {searchQuery ? "No students match your search." : "No students found."}
          </p>
        </motion.div>
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
                <AnimatePresence>
                  {paginatedStudents.map((student) => (
                    <StudentRow key={student._id} student={student} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <motion.button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
              <div className="pagination-pages">
                {getPageNumbers().map((page, index) => (
                  <motion.button
                    key={index}
                    className={`pagination-page ${
                      page === currentPage ? "active" : ""
                    } ${page === "..." ? "ellipsis" : ""}`}
                    onClick={() => typeof page === "number" && handlePageChange(page)}
                    disabled={page === "..."}
                    whileHover={{ scale: page !== "..." ? 1.05 : 1 }}
                    whileTap={{ scale: page !== "..." ? 0.95 : 1 }}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>
              <motion.button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          )}
        </>
      )}
      {chatUser && <ChatBoxPortal user={chatUser} onClose={() => setChatUser(null)} />}
      {updateModalUser && (
        <ModalPortal onClose={() => setUpdateModalUser(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Student</h5>
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
              <h5 className="modal-title">Student Details</h5>
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
          margin: 0 auto;
          padding: 0 15px;
        }

        .input-group {
          max-width: 400px;
          border-radius: 8px;
          overflow: hidden;
        }

        .table {
          background-color: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          table-layout: fixed;
        }

        .table th,
        .table td {
          padding: 14px;
          vertical-align: middle;
          min-height: 60px;
        }

        .table th {
          font-weight: 600;
          color: #1f2937;
          background: #f9fafb;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .table td {
          color: #374151;
        }

        .table tr:hover {
          background-color: #f1f5f9;
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
          background-color: #e5e7eb;
        }

        .cursor-pointer {
          cursor: pointer;
          text-decoration: underline;
          color: #2563eb;
          transition: color 0.2s ease;
        }

        .cursor-pointer:hover {
          color: #1e40af;
        }

        .btn-group {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .btn-group .btn {
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .position-relative {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: #dc3545;
          color: white;
          font-size: 10px;
          font-weight: 600;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge {
          font-size: 0.8rem;
          padding: 0.4em 0.8em;
          border-radius: 12px;
          min-width: 70px;
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
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: 12px;
          color: #374151;
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
          width: 320px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 10px;
        }

        .pagination-button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .pagination-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 5px;
        }

        .pagination-page {
          padding: 8px 12px;
          background-color: #f8f9fa;
          color: #343a40;
          border: 1px solid #e4e6eb;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-page:hover:not(.ellipsis):not(.active) {
          background-color: #e4e6eb;
        }

        .pagination-page.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .pagination-page.ellipsis {
          background-color: transparent;
          border: none;
          cursor: default;
          display: flex;
          align-items: center;
        }

        .form-control {
          border: 1px solid #d1d5db;
          border-radius: 0;
          padding: 10px;
          font-size: 0.95rem;
        }

        .input-group-text {
          border: 1px solid #d1d5db;
          border-right: none;
          background-color: #fff;
        }

        .btn-outline-secondary {
          border-color: #d1d5db;
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
          .input-group {
            max-width: 100%;
          }

          .notification-badge {
            width: 14px;
            height: 14px;
            font-size: 9px;
            top: -3px;
            right: -3px;
          }

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
            margin-bottom: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background-color: #fff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          }

          .table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border: none;
            font-size: 0.9rem;
            min-height: 50px;
          }

          .table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #1f2937;
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
            gap: 6px;
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
            font-size: 1.75rem;
          }

          .loading-text {
            font-size: 0.9rem;
          }

          .chat-bubble-container {
            bottom: 15px;
            right: 15px;
            width: 90%;
            max-width: 300px;
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
            flex-wrap: wrap;
            gap: 5px;
          }

          .pagination-button {
            padding: 6px 12px;
            font-size: 12px;
          }

          .pagination-page {
            padding: 6px 10px;
            font-size: 12px;
          }
        }

        .modal {
          z-index: 1050;
        }

        .modal-content {
          border-radius: 10px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          background-color: #fff;
        }

        .modal-header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-footer {
          border-top: 1px solid #e5e7eb;
        }

        .form-control,
        .form-select {
          border-radius: 6px;
          border: 1px solid #d1d5db;
        }

        .modal-body p {
          margin: 0;
          color: #374151;
        }

        .modal-body .badge {
          font-size: 0.85rem;
        }

        .btn-primary {
          background-color: #2563eb;
          border-color: #2563eb;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background-color: #1e40af;
          border-color: #1e40af;
        }

        .btn-secondary {
          background-color: #6b7280;
          border-color: #6b7280;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background-color: #4b5563;
          border-color: #4b5563;
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