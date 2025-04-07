import React, { useState, useEffect, useRef } from "react";
import { get, put } from "../apiHelper";
import io from "socket.io-client";

function ContactList({ tutors, onSelectTutor }) {
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    // Log socket connection
    socketRef.current.on("connect", () => {
      console.log("📡 ContactList socket connected:", socketRef.current.id);
      socketRef.current.emit("join_room", userId);
    });

    // Log any socket errors
    socketRef.current.on("connect_error", (err) => {
      console.error("❌ ContactList socket connection error:", err.message);
    });

    // Listen for new messages
    socketRef.current.on("new_message", (message) => {
      console.log("📨 New message received in ContactList:", message);

      if (message.receiver._id === userId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender._id]: (prev[message.sender._id] || 0) + 1,
        }));
      }
    });

    // Listen for read events
    socketRef.current.on("message_read", ({ messageId }) => {
      console.log("✅ Message read:", messageId);
    });

    socketRef.current.on("messages_read", ({ readBy, messageIds }) => {
      console.log("📥 Messages read by:", readBy);
      fetchUnreadCounts();
    });

    // Initial fetch
    fetchUnreadCounts();

    // Cleanup
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const response = await get("/messages/unread-counts-by-sender");
      console.log("📊 Unread counts:", response);
      setUnreadCounts(response.counts || {});
    } catch (error) {
      console.error("⚠️ Error fetching unread counts:", error);
    }
  };

  const handleSelectTutor = (tutor) => {
    onSelectTutor(tutor);

    setUnreadCounts((prev) => ({
      ...prev,
      [tutor._id]: 0,
    }));

    try {
      put(`/messages/mark-all-read/${tutor._id}`);
    } catch (error) {
      console.error("⚠️ Error marking messages as read:", error);
    }
  };

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contact-list">
      <h4 className="mb-3">Your Contacts</h4>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search tutors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul className="list-group">
        {filteredTutors.map((tutor) => (
          <li
            key={tutor._id}
            className="list-group-item d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => handleSelectTutor(tutor)}
          >
            <div className="d-flex align-items-center">
              <img
                src={tutor.profilePic || "https://via.placeholder.com/40"}
                alt={tutor.name}
                className="rounded-circle me-2"
                style={{ width: "40px", height: "40px" }}
              />
              <span>{tutor.name}</span>
            </div>

            {unreadCounts[tutor._id] > 0 && (
              <span className="badge bg-danger rounded-pill">
                {unreadCounts[tutor._id]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContactList;
