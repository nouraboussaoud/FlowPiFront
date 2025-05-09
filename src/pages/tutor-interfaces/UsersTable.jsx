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
import LayoutTutor from "../dashboard/LayoutTutorss";
import LayoutTutorss from "../dashboard/LayoutTutorss";

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

  // Add this helper function to properly format profile picture URLs
  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return PLACEHOLDER_IMAGE;
    return profilePic.startsWith("http")
      ? profilePic
      : `http://localhost:5000/uploads/${profilePic}`;
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login.");
        console.log("Fetching students with token:", token); // Debug log

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
        const message =
          err.response?.data?.message || err.message || "Failed to fetch students";
        setError(message);
        if (message.includes("token") || err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          "http://localhost:5000/api/messages/unread-counts-by-sender",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const unreadCounts = response.data.counts || {};
        const counts = {};
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
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      setError("Please log in to receive real-time notifications");
      navigate("/login");
      return;
    }

    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    let tutorId = null;

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        tutorId = decoded.userId || decoded._id;
        socketRef.current.emit("join", tutorId);
        console.log("Joined room:", tutorId);
      } catch (error) {
        console.error("Error decoding token:", error);
        setError("Failed to initialize real-time notifications");
      }
    });

    socketRef.current.on("reconnect", () => {
      console.log("Socket reconnected");
      if (tutorId) {
        socketRef.current.emit("join", tutorId);
        console.log("Rejoined room:", tutorId);
      }
    });

    socketRef.current.on("new_message", (message) => {
      console.log("New message received via socket:", message);
      let senderId;
      if (typeof message.sender === "object" && message.sender?._id) {
        senderId = message.sender._id;
      } else if (typeof message.sender === "string") {
        senderId = message.sender;
      } else {
        console.error("Invalid sender format in message:", message.sender);
        return;
      }

      const senderRole = message.sender?.role || "unknown";
      if (senderId !== chatUser?._id && senderRole === "student") {
        setUnreadMessages((prev) => {
          const newCounts = { ...prev };
          newCounts[senderId] = (newCounts[senderId] || 0) + 1;
          console.log("Updated unread counts:", newCounts);
          return newCounts;
        });
        toast.info(`New message from ${message.sender?.name || "Student"}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    });

    socketRef.current.on("message_read", ({ senderId }) => {
      console.log(`Messages from sender ${senderId} marked as read`);
      setUnreadMessages((prev) => ({
        ...prev,
        [senderId]: 0,
      }));
    });

    return () => {
      console.log("Disconnecting socket");
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate, chatUser]); // Added chatUser to dependencies

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

  // Fix for search function to maintain pagination when possible
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(lowerQuery) ||
          (student.email && student.email.toLowerCase().includes(lowerQuery))
      );
      setFilteredStudents(filtered);
      
      // Only reset to page 1 if the current page would be invalid with the new filtered results
      const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
      // Otherwise keep the same page
    }, 300);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchQuery, students, itemsPerPage, currentPage]);

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
      if (!token) throw new Error("No token found");
      setActionLoading((prev) => ({ ...prev, [`chat-${user._id}`]: true }));

      // Mark messages as read
      await axios.put(
        `http://localhost:5000/api/messages/mark-all-read/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update badge immediately
      setUnreadMessages((prev) => ({
        ...prev,
        [user._id]: 0,
      }));

      // Emit socket event to notify other clients
      socketRef.current.emit("mark_messages_read", {
        senderId: user._id,
        tutorId: JSON.parse(atob(token.split('.')[1])).userId,
      });

      setChatUser(user);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to mark messages as read");
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [`chat-${user._id}`]: false }));
    }
  };

  const debouncedDeleteUser = debounce(async (userId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: true }));
    try {
      const token = localStorage.getItem("token");
      console.log("Deleting user with token:", token); // Debug log
      await axios.delete(`http://localhost:5000/api/users/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Get current page data before update
      const currentPageData = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
      
      // Update students and filtered students
      const updatedStudents = students.filter((student) => student._id !== userId);
      const updatedFilteredStudents = filteredStudents.filter((student) => student._id !== userId);
      
      setStudents(updatedStudents);
      setFilteredStudents(updatedFilteredStudents);
      
      setUnreadMessages((prev) => {
        const newCounts = { ...prev };
        delete newCounts[userId];
        return newCounts;
      });
      
      // Only change page if necessary
      if (currentPageData.length === 1 && currentPage > 1) {
        // If we deleted the last item on this page, go back one page
        setCurrentPage(currentPage - 1);
      } else {
        // Calculate if we need to adjust the current page based on remaining items
        const totalPages = Math.ceil(updatedFilteredStudents.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
        // Otherwise keep the same page
      }
      
      toast.success("Student deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(error.response?.data?.message || "Error deleting student");
        toast.error(error.response?.data?.message || "Error deleting student", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: false }));
    }
  }, 300);

  // Fix for toggle status function
  const debouncedToggleStatus = debounce(async (userId, isActive) => {
    setActionLoading((prev) => ({ ...prev, [`toggle-${userId}`]: true }));
    try {
      const token = localStorage.getItem("token");
      console.log("Toggling status with token:", token); // Debug log
      const response = await axios.put(
        `http://localhost:5000/api/users/toggle-status/${userId}`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the user in both arrays without changing pagination
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
      
      toast.success(`Student ${response.data.user.isActive ? 'activated' : 'deactivated'} successfully`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(error.response?.data?.message || "Error toggling status");
        toast.error(error.response?.data?.message || "Error toggling status", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [`toggle-${userId}`]: false }));
    }
  }, 300);

  // Fix for ban/unban function
  const debouncedBanUnban = debounce(async (userId, isBanned) => {
    setActionLoading((prev) => ({ ...prev, [`ban-${userId}`]: true }));
    try {
      const token = localStorage.getItem("token");
      console.log("Banning/unbanning with token:", token); // Debug log
      const response = await axios.put(
        `http://localhost:5000/api/users/ban-user/${userId}`,
        { action: isBanned ? "unban" : "ban" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the user in both arrays without changing pagination
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
      
      toast.success(`Student ${isBanned ? 'unbanned' : 'banned'} successfully`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(error.response?.data?.message || "Error banning/unbanning student");
        toast.error(error.response?.data?.message || "Error banning/unbanning student", {
          position: "top-right",
          autoClose: 3000,
        });
      }
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
      if (!token) {
        setError("No token found. Please login.");
        return;
      }
      
      // Log the data we're sending to help debug
      console.log("Updating user:", {
        id: updateModalUser._id,
        name: updateModalUser.name,
        email: updateModalUser.email,
        role: updateModalUser.role
      });
      
      // Make the API request
      const response = await axios.put(
        `http://localhost:5000/api/users/update/${updateModalUser._id}`,
        {
          name: updateModalUser.name,
          email: updateModalUser.email,
          role: updateModalUser.role
        },
        { 
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Log the full response for debugging
      console.log("Update response:", response);
      
      // Simple approach: refetch all students to ensure data consistency
      const studentsResponse = await axios.get(
        "http://localhost:5000/api/users/getAll",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const studentUsers = studentsResponse.data.filter(
        (user) => user.role === "student"
      );
      
      setStudents(studentUsers);
      setFilteredStudents(studentUsers);
      
      // Close the modal
      setUpdateModalUser(null);
      
      // Show success message
      toast.success("Student updated successfully", {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      // Detailed error logging
      console.error("Update error:", error);
      console.error("Error response:", error.response);
      
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        // Extract the most specific error message possible
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          "Error updating student";
        
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000
        });
      }
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
            src={getProfilePicUrl(student.profilePic)}
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
              <span
                style={{
                  display: "inline-block",
                  marginLeft: "5px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "4px",
                  padding: "0 4px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                  verticalAlign: "text-top",
                }}
              >
                {unreadMessages[student._id]}
              </span>
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
    <LayoutTutorss>
    <div className="container my-4">
      <div className="dashboard-header">
        <motion.h2
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Student Directory
        </motion.h2>
        
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search students"
          />
          {searchQuery && (
            <button
              className="clear-button"
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

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .search-box {
          display: flex;
          align-items: center;
          background-color: #f8f9fa;
          border-radius: 50px;
          padding: 0 20px;
          width: 350px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .search-box:focus-within {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          background-color: white;
        }

        .search-box i.bi-search {
          color: #6c757d;
          font-size: 1.2rem;
          margin-right: 10px;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 12px 0;
          font-size: 1rem;
          color: #495057;
          outline: none;
        }

        .search-box input::placeholder {
          color: #adb5bd;
        }

        .clear-button {
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin-left: 10px;
          transition: color 0.2s;
        }

        .clear-button:hover {
          color: #343a40;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .page-title {
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
          }
          
          .search-box {
            width: 100%;
          }
        }

        .table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 1.5rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          background-color: #ffffff;
        }

        .table th {
          background-color: #4a6cf7;
          color: white;
          font-weight: 600;
          text-align: left;
          padding: 14px 18px;
          font-size: 14px;
        }

        .table td {
          padding: 14px 18px;
          border-top: 1px solid #edf2f7;
          vertical-align: middle;
          color: #2d3748;
        }

        .table tr:hover {
          background-color: #f8fafc;
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
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-group .btn {
          border-radius: 8px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: none;
        }

        .btn-outline-primary {
          background-color: #eef2ff;
          color: #4f46e5;
          border: none;
        }

        .btn-outline-primary:hover {
          background-color: #4f46e5;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
        }

        .btn-outline-warning {
          background-color: #fff7ed;
          color: #f59e0b;
          border: none;
        }

        .btn-outline-warning:hover {
          background-color: #f59e0b;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
        }

        .btn-outline-danger {
          background-color: #fee2e2;
          color: #ef4444;
          border: none;
        }

        .btn-outline-danger:hover {
          background-color: #ef4444;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }

        .btn-outline-info {
          background-color: #dbeafe;
          color: #3b82f6;
          border: none;
        }

        .btn-outline-info:hover {
          background-color: #3b82f6;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .btn-outline-secondary {
          background-color: #f3f4f6;
          color: #6b7280;
          border: none;
        }

        .btn-outline-secondary:hover {
          background-color: #6b7280;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(107, 114, 128, 0.3);
        }

        .btn-outline-success {
          background-color: #d1fae5;
          color: #10b981;
          border: none;
        }

        .btn-outline-success:hover {
          background-color: #10b981;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
        }

        .badge {
          font-size: 0.8rem;
          padding: 0.5em 1em;
          border-radius: 20px;
          min-width: 80px;
          text-align: center;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .bg-success {
          background-color: #10b981 !important;
        }

        .bg-danger {
          background-color: #ef4444 !important;
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
          margin-top: 24px;
          gap: 10px;
        }

        .pagination-button {
          padding: 10px 18px;
          background-color: #4a6cf7;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(74, 108, 247, 0.2);
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #3a5bd9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(74, 108, 247, 0.3);
        }

        .pagination-button:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 6px;
        }

        .pagination-page {
          padding: 8px 14px;
          background-color: #f8fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .pagination-page:hover:not(.ellipsis):not(.active) {
          background-color: #edf2f7;
          transform: translateY(-2px);
        }

        .pagination-page.active {
          background-color: #4a6cf7;
          color: white;
          border-color: #4a6cf7;
          box-shadow: 0 2px 4px rgba(74, 108, 247, 0.2);
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
          border-radius: 10 кафеpx;
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

        .btn-danger {
          background-color: var(--danger, #ef4444);
          color: white;
        }

        .btn-danger:hover {
          background-color: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-info {
          background-color: var(--info, #3b82f6);
          color: white;
        }

        .btn-info:hover {
          background-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .search-container {
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-input {
          flex: 1;
          max-width: 300px;
          padding: 10px 12px;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 6px;
          font-size: 14px;
          background-color: var(--content-bg, #ffffff);
          color: var(--text-color, #1f2937);
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        @media (min-width: 768px) {
          .modal-dialog {
            max-width: 500px;
          }
        }
      `}</style>
    </div>
    </LayoutTutorss>
  );
};

export default UsersTable;
