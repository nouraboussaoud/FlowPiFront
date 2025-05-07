import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import DashboardLayout from "./DashboardLayout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage] = useState(5);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [groupToUpdate, setGroupToUpdate] = useState(null);
  const [updatedGroupName, setUpdatedGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [nameError, setNameError] = useState("");

  // Vérification du nom de groupe en temps réel
  useEffect(() => {
    const checkGroupName = async () => {
      if (!updatedGroupName || !groupToUpdate) return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/groups/check-name?name=${encodeURIComponent(updatedGroupName)}&excludeId=${groupToUpdate._id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        
        if (!response.ok) throw new Error("Failed to check group name");
        
        const data = await response.json();
        if (data.exists) {
          setNameError("This group name is already taken");
        } else {
          setNameError("");
        }
      } catch (error) {
        console.error("Error checking group name:", error);
      }
    };

    const timer = setTimeout(() => {
      checkGroupName();
    }, 500);

    return () => clearTimeout(timer);
  }, [updatedGroupName, groupToUpdate]);

  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please login.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/groups/getAllGroups", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch groups");
  
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching groups:", error);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/users/getAll", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const handleMemberSelection = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleEditGroup = (group) => {
    setGroupToUpdate(group);
    setUpdatedGroupName(group.name);
    setSelectedMembers(group.members.map((member) => member._id));
    setShowUpdateModal(true);
    setNameError("");
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatedGroupName("");
    setGroupToUpdate(null);
    setSelectedMembers([]);
    setNameError("");
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    
    if (nameError) {
      toast.error("Please fix the group name error before submitting");
      return;
    }

    if (!updatedGroupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || !groupToUpdate) {
      setError("Group or token is missing.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/groups/updateGroup/${groupToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updatedGroupName,
          members: selectedMembers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update group");
      }

      const updatedGroup = await response.json();
      setGroups(groups.map(g => g._id === updatedGroup._id ? updatedGroup : g));
      await fetchGroups(); // Cette ligne est cruciale
      closeUpdateModal();
      toast.success("Group updated successfully!");
    } catch (error) {
      setError(error.message);
      console.error("Error updating group:", error);
      toast.error(error.message);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/groups/deleteGroup/${groupId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to delete group");
        setGroups(groups.filter(group => group._id !== groupId));
        toast.success("Group deleted successfully!");
      } catch (error) {
        console.error("Error deleting group:", error);
        toast.error(error.message);
      }
    }
  };

  // Pagination logic
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup);

  return (
    <DashboardLayout>
      <div className="container mt-5">
        <h1 className="text-center mb-4">Groups List</h1>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row">
          {currentGroups.length === 0 ? (
            <div className="col-12 text-center">No groups found.</div>
          ) : (
            currentGroups.map((group) => (
              <div className="col-md-4 col-12 mb-4" key={group._id}>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      <strong>Name:</strong> {group.name}
                    </h5>

                    <p className="card-text">
                      <strong>Members:</strong>
                      <ul>
                        {group.members.map((member) => (
                          <li key={member._id}>
                            {member.name}
                            {member.skills?.length > 0 && (
                              <div>
                                <small>Skills: 
                                  {member.skills.map((skill, i) => (
                                    <span key={i} className="badge bg-secondary me-1">{skill}</span>
                                  ))}
                                </small>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </p>

                    <p className="card-text mt-3">
                      <strong>Assigned Subjects:</strong>
                      {group.assignedSubjects?.length > 0 ? (
                        <ul className="mt-2">
                          {group.assignedSubjects.map(subject => (
                            <li key={subject._id}>
                              <strong>{subject.title}</strong>
                              <p className="small text-muted mb-1">{subject.description}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted">No subjects assigned</div>
                      )}
                    </p>

                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleEditGroup(group)}
                      >
                        <FaEdit /> Update
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteGroup(group._id)}
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="d-flex justify-content-center my-4">
          <button 
            className="btn btn-outline-secondary me-2" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(groups.length / groupsPerPage)}
          >
            Next
          </button>
        </div>

        {showUpdateModal && (
          <div className="modal show" style={{ display: "block", backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Group</h5>
                  <button type="button" className="close" onClick={closeUpdateModal}>
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleUpdateGroup}>
                    <div className="form-group">
                      <label htmlFor="groupName">Group Name*</label>
                      <input
                        type="text"
                        className={`form-control ${nameError ? 'is-invalid' : ''}`}
                        id="groupName"
                        value={updatedGroupName}
                        onChange={(e) => setUpdatedGroupName(e.target.value)}
                        required
                        maxLength="50"
                      />
                      {nameError && <div className="invalid-feedback">{nameError}</div>}
                      <small className="text-muted">
                        {updatedGroupName.length}/50 characters
                      </small>
                    </div>
                    <div className="form-group">
                      <label>Select Members*</label>
                      <div className="member-selection" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {users.map((user) => (
                          <div key={user._id} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedMembers.includes(user._id)}
                              onChange={() => handleMemberSelection(user._id)}
                              id={`member-${user._id}`}
                            />
                            <label className="form-check-label" htmlFor={`member-${user._id}`}>
                              {user.name} ({user.email})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">
                      Update Group
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GroupList;