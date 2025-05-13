import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutStudent from '../dashboard/LayoutStudent';
import Contact from "../../student-interfaces/Contact";
import Chatbox from "../tutor-interfaces/chatbox/ChatBox";
import { get } from "../../apiHelper";

const ReturnDeliverable = () => {
  const [title, setTitle] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [commits, setCommits] = useState([]);
  const [gitCommitURL, setGitCommitURL] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  
  // Chat functionality states
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showContactList, setShowContactList] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
  // Try multiple possible token keys
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const res = await fetch(`https://api.github.com/user/repos?per_page=100&type=all`, { headers });
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        setRepositories(data);
      } catch (error) {
        console.error("Failed to fetch repositories", error);
      }
    };

    fetchRepositories();
    
    // Fetch tutors for chat
    fetchTutors();
    
    // Fetch unread messages count
    fetchUnreadMessagesCount();
    
    // Set up message polling interval
    const messageInterval = setInterval(fetchUnreadMessagesCount, 30000);
    
    return () => {
      clearInterval(messageInterval);
    };
  }, []);
  
  // Chat functionality methods
  const fetchTutors = () => {
    get("/users/tutors")
      .then((data) => {
        setTutors(data);
      })
      .catch((error) => {
        console.error("Error fetching tutors:", error);
      });
  };
  
  const fetchUnreadMessagesCount = () => {
    get("/messages/unread")
      .then((data) => {
        setUnreadMessages(data?.count || 0);
      })
      .catch((error) => {
        console.error("Error fetching unread messages:", error);
      });
  };
  
  const toggleContactList = () => {
    setShowContactList(!showContactList);
  };
  
  const closeContactList = () => {
    setShowContactList(false);
  };
  
  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setShowContactList(false);
    setShowChatBubble(false); // Keep bubble hidden when chatbox is open
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };
  
  const handleCloseChatbox = () => {
    setSelectedTutor(null);
    setShowChatBubble(true);
  };

  const handleRepoChange = async (e) => {
    const repoName = e.target.value;
    setSelectedRepo(repoName);
    setSelectedBranch("");
    setCommits([]);
    setGitCommitURL("");

    try {
      const res = await fetch(`https://api.github.com/repos/${repoName}/branches`, { headers });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches", error);
    }
  };

  const handleBranchChange = async (e) => {
    const branchName = e.target.value;
    setSelectedBranch(branchName);
    setGitCommitURL("");

    try {
      const res = await fetch(`https://api.github.com/repos/${selectedRepo}/commits?sha=${branchName}`, { headers });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();
      const formattedCommits = data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        date: commit.commit.author.date,
        url: commit.html_url
      }));
      setCommits(formattedCommits);
    } catch (error) {
      console.error("Failed to fetch commits", error);
    }
  };

  const handleCommitSelect = (commitUrl) => {
    setGitCommitURL(commitUrl);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debug localStorage contents
    console.log("localStorage contents:", Object.fromEntries(Object.entries(localStorage)));
    console.log("Using token:", token);

    // Validate token
    if (!token || !token.startsWith("eyJhbGci")) {
      alert("No valid authentication token found. Please log in again.");
      navigate("/login");
      return;
    }

    // Decode token for debugging (client-side, no verification)
    let payload;
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
      console.log("Token payload:", payload);
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.log("Token expired at:", new Date(payload.exp * 1000));
        alert("Authentication token has expired. Please log in again.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      // Check payload key (id vs userId)
      if (!payload.userId && payload.id) {
        console.warn("Token uses 'id' instead of 'userId'. Backend may expect 'userId'.");
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      alert("Invalid token format. Please log in again.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("github_commit_url", gitCommitURL);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/deliverables/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await res.json();
      console.log("Backend response:", responseData);

      if (res.ok) {
        alert("Deliverable submitted successfully!");
        navigate("/deliverables-history");
      } else {
        console.error("Submission failed:", responseData);
        alert(`Failed to submit deliverable: ${responseData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Failed to submit deliverable:", error);
      alert("An error occurred while submitting the deliverable.");
    }
  };

  return (
    <LayoutStudent>
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-transparent border-bottom">
                <h3 className="card-header-title mb-0">Return Deliverable</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="repo" className="form-label">Repository</label>
                    <select
                      className="form-select"
                      id="repo"
                      value={selectedRepo}
                      onChange={handleRepoChange}
                      required
                    >
                      <option value="">Choose a repository...</option>
                      {repositories.map((repo) => (
                        <option key={repo.id} value={repo.full_name}>
                          {repo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRepo && (
                    <div className="mb-3">
                      <label htmlFor="branch" className="form-label">Branch</label>
                      <select
                        className="form-select"
                        id="branch"
                        value={selectedBranch}
                        onChange={handleBranchChange}
                        required
                      >
                        <option value="">Choose a branch...</option>
                        {branches.map((branch) => (
                          <option key={branch.name} value={branch.name}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedBranch && (
                    <div className="mb-3">
                      <label htmlFor="commit" className="form-label">Commit</label>
                      <select
                        className="form-select"
                        id="commit"
                        value={gitCommitURL}
                        onChange={(e) => handleCommitSelect(e.target.value)}
                        required
                      >
                        <option value="">Choose a commit...</option>
                        {commits.map((commit) => (
                          <option key={commit.sha} value={commit.url}>
                            {commit.message} - {commit.date}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="file" className="form-label">File</label>
                    <input
                      type="file"
                      className="form-control"
                      id="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">Submit Deliverable</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat functionality */}
      <div className="chat-bubble-container">
        {showChatBubble && !selectedTutor && (
          <div
            className={`chat-bubble ${showContactList ? 'active' : ''}`}
            onClick={toggleContactList}
          >
            <i className="fas fa-comments"></i>
            {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
          </div>
        )}

        {showContactList && (
          <div className="contact-list-panel">
            <div className="panel-header">
              <h3>Contacts</h3>
              <button className="close-btn" onClick={closeContactList}>×</button>
            </div>
            <div className="panel-body">
              <Contact tutors={tutors} onSelectTutor={handleSelectTutor} />
            </div>
          </div>
        )}
      </div>

      {selectedTutor && (
        <Chatbox user={selectedTutor} onClose={handleCloseChatbox} />
      )}
      
      <style jsx>{`
        .chat-bubble-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        
        .chat-bubble {
          width: 60px;
          height: 60px;
          background-color: #007bff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          position: relative;
        }
        
        .chat-bubble:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        
        .chat-bubble.active {
          background-color: #0056b3;
        }
        
        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff4136;
          color: white;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .contact-list-panel {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 300px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }
        
        .panel-body {
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </LayoutStudent>
  );
};

export default ReturnDeliverable;
