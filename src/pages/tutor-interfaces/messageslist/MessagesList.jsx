
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { get } from "../../../apiHelper";
import LayoutStudent from "../../dashboard/LayoutStudent";
import Chatbox from "../chatbox/ChatBox";
import "./MessagesList.css";

const MessagesList = ({ currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const socket = io("http://localhost:5000", {
    auth: { token: localStorage.getItem("token") },
  });

  useEffect(() => {
    // Fetch conversations when component mounts
    get("/messages/conversations")
      .then((data) => {
        console.log("Fetched Conversations:", data); // Debugging log
        setConversations(data);
      })
      .catch((err) => console.error("Error fetching conversations:", err));

    // Listen for new messages
    socket.on("new_message", (message) => {
      // Only update the conversation if the selected user is the receiver
      if (message.receiver._id === currentUser._id || message.sender._id === currentUser._id) {
        // Re-fetch the conversations to ensure that the new message is reflected
        get("/messages/conversations")
          .then((data) => {
            setConversations(data);
          })
          .catch((err) => console.error("Error fetching updated conversations:", err));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const openChat = (user) => {
    setSelectedUser(user);
  };

  return (
    <LayoutStudent>
      <div className="row">
        {/* Conversation list on the left */}
        <div className="col-md-4">
          <div className="messages-list">
            <h2>Messages</h2>
            <ul className="list-group">
              {conversations.map((conv, index) => {
                // Ensure that sender and receiver are defined
                if (!conv.sender || !conv.receiver) {
                  console.error("Invalid conversation data", conv);
                  return null;
                }

                // Ensure that the sender and receiver are valid objects with _id properties
                const sender = conv.sender || {};
                const receiver = conv.receiver || {};
                if (!sender._id || !receiver._id) {
                  console.error("Invalid sender or receiver data", conv);
                  return null; // Skip conversation if sender or receiver is invalid
                }

                // Identify the other user (the user you're not chatting with)
                const otherUser = sender._id === localStorage.getItem("id") ? receiver : sender;

                // If otherUser is missing or doesn't have an _id, skip the conversation
                if (!otherUser._id) return null;

                return (
                  <li
                  key={otherUser._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  onClick={() => openChat(otherUser)}
                >
                  <span>{otherUser.name}</span>
                </li>
                
                );
              })}
            </ul>
          </div>
        </div>

        {/* Chatbox on the right */}
        <div className="col-md-8">
          {selectedUser && (
            <div className="chatbox-container">
              <Chatbox user={selectedUser} onClose={() => setSelectedUser(null)} />
            </div>
          )}
        </div>
      </div>
    </LayoutStudent>
  );
};

export default MessagesList;
