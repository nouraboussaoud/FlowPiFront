import React, { useState, useEffect, useRef } from "react";
import { get, put } from "../apiHelper";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import "./contact.css";

function ContactList({ tutors, onSelectTutor }) {
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const audioInitialized = useRef(false);
  const processedMessages = useRef(new Set()); // Track processed message IDs

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("📡 ContactList socket connected:", socketRef.current.id);
      socketRef.current.emit("join_room", userId);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ ContactList socket connection error:", err.message);
    });

    socketRef.current.on("new_message", (message) => {
      console.log("📨 New message received in ContactList:", message);

      if (
        message.receiver._id === userId &&
        !processedMessages.current.has(message._id)
      ) {
        processedMessages.current.add(message._id);
        playNotificationSound();
        
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender._id]: (prev[message.sender._id] || 0) + 1,
        }));
      }
    });

    socketRef.current.on("message_read", ({ messageId }) => {
      console.log("✅ Message read:", messageId);
    });

    socketRef.current.on("messages_read", ({ readBy, messageIds }) => {
      console.log("📥 Messages read by:", readBy);
      fetchUnreadCounts();
    });

    fetchUnreadCounts();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const initializeAudio = () => {
    if (!audioInitialized.current) {
      try {
        audioRef.current = new Audio("/notifications.mp3");
        audioRef.current.preload = "auto";
        audioRef.current.oncanplaythrough = () => {
          console.log("🎵 Notification sound loaded successfully");
        };
        audioRef.current.onerror = () => {
          console.error("❌ Failed to load notification sound at /notifications.mp3");
        };
        audioInitialized.current = true;
      } catch (error) {
        console.error("❌ Error initializing audio:", error);
      }
    }
  };

  const playNotificationSound = () => {
    if (!audioRef.current) {
      console.warn("🎵 Audio not initialized, initializing now...");
      initializeAudio();
    }

    if (audioRef.current) {
      try {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error.name === "NotAllowedError") {
              console.warn("🎵 Autoplay blocked. Sound will play after user interaction.");
            } else {
              console.error("❌ Error playing notification sound:", error);
            }
          });
        }
      } catch (error) {
        console.error("❌ Error in playNotificationSound:", error);
      }
    } else {
      console.warn("🎵 Audio file not available");
    }
  };

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
    initializeAudio(); // Initialize audio on user interaction
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

  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) {
      return "https://via.placeholder.com/40";
    }
    return profilePic.startsWith("http")
      ? profilePic
      : `http://localhost:5000/uploads/${profilePic}`;
  };

  useEffect(() => {
    console.log("📋 Tutors received:", tutors);
    tutors.forEach((tutor) => {
      console.log(`Tutor: ${tutor.name}, ProfilePic: ${tutor.profilePic}`);
    });
  }, [tutors]);

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasUnreadMessages = Object.values(unreadCounts).some(count => count > 0);

  return (
    <div className="contact-sidebar">
      <div className="contact-header">
        <h4 className="contact-title">Your Contacts</h4>
        
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={`contact-scroll-area ${hasUnreadMessages ? 'has-unread' : ''}`}>
        {filteredTutors.length > 0 ? (
          <ul className="contact-list">
            {filteredTutors.map((tutor) => (
              <li
                key={tutor._id}
                className={`contact-item ${unreadCounts[tutor._id] > 0 ? 'has-unread' : ''}`}
                onClick={() => handleSelectTutor(tutor)}
              >
                <div className="contact-avatar-container">
                  <img
                    src={getProfilePicUrl(tutor.profilePic)}
                    alt={tutor.name}
                    className="contact-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/40";
                    }}
                  />
                  {unreadCounts[tutor._id] > 0 && (
                    <span className="unread-indicator">{unreadCounts[tutor._id]}</span>
                  )}
                </div>
                <div className="contact-info">
                  <span className="contact-name">{tutor.name}</span>
                  {unreadCounts[tutor._id] > 0 && (
                    <span className="unread-text">New messages</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-contacts">
            <FontAwesomeIcon icon={faUserCircle} size="3x" />
            <p>No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactList;