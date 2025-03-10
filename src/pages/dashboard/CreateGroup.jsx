import React, { useState, useEffect } from "react";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  // Fetch users when component mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/users/getAll", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Data is not an array:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  // Fetch groups after creating a group or when the component mounts
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

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const groups = await response.json();
      console.log("Groups fetched successfully:", groups);
      setGroups(groups);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching groups:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please login.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/groups/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          members: selectedMembers, // Array of user IDs
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const result = await response.json();
      console.log("Group created successfully:", result);

      // Fetch the updated list of groups after creation
      fetchGroups();

      // Clear input and selection after submission
      setGroupName("");
      setSelectedMembers([]);
    } catch (error) {
      setError(error.message);
      console.error("Error creating group:", error);
    }
  };

  const handleMemberSelection = (userId) => {
    setSelectedMembers((prevMembers) =>
      prevMembers.includes(userId)
        ? prevMembers.filter((id) => id !== userId)
        : [...prevMembers, userId]
    );
  };

  return (
    <div>
      <h2>Create a New Group</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Select Members:</label>
          <div>
            {users.map((user) => (
              <div key={user._id}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user._id)}
                  onChange={() => handleMemberSelection(user._id)}
                />
                <span>{user.name} ({user.email})</span>
              </div>
            ))}
          </div>
        </div>

        <button type="submit">Create Group</button>
      </form>

      {/* Display the created groups */}
      <h3>Existing Groups</h3>
      <ul>
        {groups.map((group) => (
          <li key={group._id}>
            <strong>{group.name}</strong>
            <p>
              Members:{" "}
              {group.members.map((member) => (
                <span key={member._id}>{member.name}</span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreateGroup;
