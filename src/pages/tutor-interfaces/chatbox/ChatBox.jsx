import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { get, post, del } from "../../../apiHelper";
import "./ChatBox.css";

const Chatbox = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageToDelete, setMessageToDelete] = useState(null);
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    get(`/messages/conversation/${user._id}`).then(setMessages);
    
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
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
};

export default Chatbox;