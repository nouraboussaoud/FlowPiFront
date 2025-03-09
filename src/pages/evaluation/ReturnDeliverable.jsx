import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutStudent from '../dashboard/LayoutStudent';

const ReturnDeliverable = ({ role, handleNavigation }) => {
  const [title, setTitle] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [commits, setCommits] = useState([]);
  const [gitCommitURL, setGitCommitURL] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Token stored in localStorage:', token);
      navigate('/return-deliverable', { replace: true });
    }

    const fetchRepositories = async () => {
      try {
        const response = await axios.get("/api/github/repositories", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`
          },
          withCredentials: true
        });
        setRepositories(response.data.repositories);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    };

    fetchRepositories();
  }, [location, navigate]);

  const handleRepoChange = async (e) => {
    const repo = e.target.value;
    setSelectedRepo(repo);

    try {
      const response = await axios.get(`/api/github/repositories/${repo}/branches`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`
        },
        withCredentials: true
      });
      setBranches(response.data.branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleBranchChange = async (e) => {
    const branch = e.target.value;
    setSelectedBranch(branch);

    try {
      const response = await axios.get(`/api/github/repositories/${selectedRepo}/branches/${branch}/commits`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`
        },
        withCredentials: true
      });
      setCommits(response.data.commits);
    } catch (error) {
      console.error("Error fetching commits:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("gitCommitURL", gitCommitURL);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/deliverables", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        alert("Deliverable submitted successfully!");
      } else {
        alert("Failed to submit deliverable.");
      }
    } catch (error) {
      console.error("Error submitting deliverable:", error);
    }
  };

  return (
    <LayoutStudent>
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card bg-transparent border rounded-3">
                <div className="card-header bg-transparent border-bottom">
                  <h3 className="card-header-title mb-0">Return Deliverable</h3>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="title">Title</label>
                    <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="repository">Repository</label>
                    <select 
                      className="form-select" 
                      id="repository" 
                      value={selectedRepo} 
                      onChange={handleRepoChange} 
                      required
                    >
                      <option value="" disabled>Choose a repository...</option>
                      {repositories.map(repo => (
                        <option key={repo.id} value={repo.name}>
                          {repo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedRepo && (
                    <div className="mb-3">
                      <label className="form-label" htmlFor="branch">Branch</label>
                      <select 
                        className="form-select" 
                        id="branch" 
                        value={selectedBranch} 
                        onChange={handleBranchChange} 
                        required
                      >
                        <option value="" disabled>Choose a branch...</option>
                        {branches.map(branch => (
                          <option key={branch.name} value={branch.name}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedBranch && (
                    <div className="mb-3">
                      <label className="form-label" htmlFor="gitCommitURL">Github Commit URL</label>
                      <select 
                        className="form-select" 
                        id="gitCommitURL" 
                        value={gitCommitURL} 
                        onChange={(e) => setGitCommitURL(e.target.value)} 
                        required
                      >
                        <option value="" disabled>Choose a commit...</option>
                        {commits.map(commit => (
                          <option key={commit.sha} value={commit.url}>
                            {commit.message} ({commit.sha.substring(0, 7)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="description">Description</label>
                    <textarea className="form-control" id="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="file">Upload File</label>
                    <input type="file" className="form-control" id="file" accept=".pdf,.docx" onChange={handleFileChange} required />
                  </div>
                  <button type="submit" className="btn btn-primary">Submit</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutStudent>
  );
};

export default ReturnDeliverable;