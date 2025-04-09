import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { get, post } from "../../../apiHelper";
import "./ChatBox.css";
const Chatbox = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  
  useEffect(() => {
    // Load existing conversation
    get(`/messages/conversation/${user._id}`).then(setMessages);
    
    const token = localStorage.getItem('token'); 
    
    // Initialize socket connection with authentication
    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    // Handle connection events
    socketRef.current.on("connect", () => {
      console.log("Socket connected");
    });
    
    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
    
    // Listen for new messages
    socketRef.current.on("new_message", (message) => {
      console.log("New message received:", message);
      if (
        (message.sender._id === user._id || message.receiver._id === user._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user._id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const message = { receiverId: user._id, content: newMessage };
      const response = await post("/messages/send", message);
      
      // Only add the message locally if it wasn't added by the socket event
      // This prevents duplicate messages
      const sentMessage = response.data;
      setMessages((prev) => {
        // Check if the message is already in the state (from socket event)
        if (!prev.find(msg => msg._id === sentMessage._id)) {
          return [...prev, sentMessage];
        }
        return prev;
      });
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>{user.name}</span>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
      <div className="chat-messages">
  {messages.length === 0 ? (
    <div className="no-messages">No messages yet</div>
  ) : (
    messages.map((msg) => (
      <div 
        key={msg._id} 
        className={`message ${msg.sender._id === user._id ? "received" : "sent"}`}
      >
        {msg.content}
      </div>
    ))
  )}
</div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chatbox;