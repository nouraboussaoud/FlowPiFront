import React, { useState, useEffect, useRef } from "react";
import { get, put } from "../apiHelper";
import io from "socket.io-client";
import "./contact.css";

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

  // Format profile picture URL
  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) {
      return "https://via.placeholder.com/40";
    }
    return profilePic.startsWith("http")
      ? profilePic
      : `http://localhost:5000/uploads/${profilePic}`;
  };

  // Log tutors for debugging
  useEffect(() => {
    console.log("📋 Tutors received:", tutors);
    tutors.forEach((tutor) => {
      console.log(`Tutor: ${tutor.name}, ProfilePic: ${tutor.profilePic}`);
    });
  }, [tutors]);

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contact-list-container">
      <h4 className="contact-list-title">Your Contacts</h4>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control contact-search"
          placeholder="Search tutors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul className="list-group contact-list">
        {filteredTutors.map((tutor) => (
          <li
            key={tutor._id}
            className="list-group-item contact-item d-flex justify-content-between align-items-center"
            onClick={() => handleSelectTutor(tutor)}
          >
            <div className="d-flex align-items-center">
              <img
                src={getProfilePicUrl(tutor.profilePic)}
                alt={tutor.name}
                className="contact-avatar rounded-circle me-2"
                onError={(e) => {
                  console.warn(`Failed to load image for ${tutor.name}: ${tutor.profilePic}`);
                  e.target.src = "https://via.placeholder.com/40";
                }}
              />
              <span className="contact-name">{tutor.name}</span>
            </div>

            {unreadCounts[tutor._id] > 0 && (
              <span className="contact-badge badge rounded-pill">
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