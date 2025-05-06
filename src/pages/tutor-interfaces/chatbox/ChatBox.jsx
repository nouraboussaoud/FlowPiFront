import React, { useState, useEffect, useRef } from "react";
import { get, post, put, del } from "../../../apiHelper";
import io from "socket.io-client";
import { toast } from "react-toastify";
import "./ChatBox.css";

const Chatbox = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const audioRef = useRef(new Audio("/notifications.mp3"));
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    get(`/messages/conversation/${user._id}`)
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
        setLoading(false);
      });
    
    const token = localStorage.getItem('token');
    
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.on("connect", () => {
      console.log("Socket connected");
    });
    
    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
    
    socketRef.current.on("new_message", (message) => {
      if (
        message.sender._id === user._id || 
        message.receiver._id === user._id
      ) {
        setMessages((prev) => [...prev, message]);
        
        // Play notification sound if the message is from the other user
        if (message.sender._id === user._id) {
          playNotificationSound();
        }
      }
    });
    
    socketRef.current.on("message_deleted", ({ messageId }) => {
      console.log("Message deleted:", messageId);
      setMessages((prev) => prev.filter(msg => msg._id !== messageId));
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [user._id]);

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      // Reset the audio to the beginning
      audioRef.current.currentTime = 0;
      
      // Play the notification sound
      audioRef.current.play().catch(error => {
        console.warn("Could not play notification sound:", error);
      });
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Check if user is banned or inactive
      if (user.isBanned || !user.isActive) {
        const status = user.isBanned ? "banned" : "inactive";
        setError(`This user's account is currently ${status}. Messages cannot be sent.`);
        return;
      }
      
      const message = { receiverId: user._id, content: newMessage };
      const response = await post("/messages/send", message);
      const sentMessage = response.data;
      
      setMessages((prev) => {
        if (!prev.find(msg => msg._id === sentMessage._id)) {
          return [...prev, sentMessage];
        }
        return prev;
      });
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Check for specific error messages from the API
      if (error.message?.includes("banned")) {
        setError("Cannot send message to banned user.");
      } else if (error.message?.includes("inactive")) {
        setError("Cannot send message to inactive user.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    }
  };
  
  const confirmDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
  };
  
  const cancelDelete = () => {
    setMessageToDelete(null);
  };
  
  const deleteMessage = async (messageId) => {
    try {
      await del(`/messages/delete/${messageId}`);
      setMessages((prev) => prev.filter(msg => msg._id !== messageId));
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  // Determine if user is banned or inactive
  const isUserRestricted = user.isBanned || !user.isActive;
  const restrictionReason = user.isBanned ? "banned" : "inactive";
  
  return (
    <div className="chat-box">
      <div className="chat-header">
        <div className="user-info">
          <span>{user.name}</span>
          {isUserRestricted && (
            <span className={`user-status ${restrictionReason}`}>
              {restrictionReason === "banned" ? "Banned" : "Inactive"}
            </span>
          )}
        </div>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
      
      {isUserRestricted && (
        <div className={`restriction-banner ${restrictionReason}`}>
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>
            {restrictionReason === "banned" 
              ? "This user is banned. You cannot exchange messages." 
              : "This user's account is inactive. Messages cannot be delivered."}
          </span>
        </div>
      )}
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.sender._id === userId ? "sent" : "received"}`}
            >
              <div className="message-content">
                <span>{msg.content}</span>
                {msg.sender._id === userId && (
                  <button
                    className="message-options-btn"
                    onClick={() => confirmDeleteMessage(msg._id)}
                    title="Options"
                  >
                    •••
                  </button>
                )}
              </div>
              
              {messageToDelete === msg._id && (
                <div className="delete-confirmation">
                  <span>Delete this message?</span>
                  <div className="delete-buttons">
                    <button 
                      className="confirm-delete-btn"
                      onClick={() => deleteMessage(msg._id)}
                    >
                      Delete
                    </button>
                    <button 
                      className="cancel-delete-btn"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>
      
      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isUserRestricted ? "Cannot send messages to this user" : "Type a message..."}
          disabled={isUserRestricted}
        />
        <button 
          onClick={sendMessage} 
          disabled={isUserRestricted}
          className={isUserRestricted ? "disabled" : ""}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
