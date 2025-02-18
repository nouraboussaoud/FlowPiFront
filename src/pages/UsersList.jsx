import React, { useEffect, useState } from "react";
import Header from "../components/Header";

const UsersList = () => {
  const [users, setUsers] = useState([]); // State to store all users
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [roleFilter, setRoleFilter] = useState("all"); // State for role filter

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from local storage
        const response = await fetch("http://localhost:5000/api/users/getAll", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token to the header
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data); // Update state with the fetched users
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []); // Run only once after the component mounts

  // Filter users based on search query and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle Ban/Unban action
  const handleBanUnban = async (userId, isCurrentlyBanned) => {
    try {
      const token = localStorage.getItem("token");
  
      // Determine the action based on the current ban status
      const action = isCurrentlyBanned ? "unban" : "ban";
  
      // Send the request to the backend
      const response = await fetch(`http://localhost:5000/api/users/ban-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }), // Send "ban" or "unban" in the request body
      });
  
      if (!response.ok) {
        throw new Error("Failed to update ban status");
      }
  
      // Update the user's ban status in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isBanned: !isCurrentlyBanned } : user
        )
      );
    } catch (error) {
      console.error("Error updating ban status:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-5">
        <h2 className="text-2xl font-semibold text-center mb-5">Users List</h2>

        {/* Search Bar and Role Filter */}
        <div className="flex justify-between mb-5">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded w-1/2"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>

        {/* Users Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="text-center">
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.role}</td>
                  <td className="border p-2">
                    <div className="flex justify-center space-x-2">
                      <button className=" mr-2">
                      <i class="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        className={`p-2 rounded ${
                          user.isBanned
                            ? "btn btn-success"
                            : "btn btn-danger"
                        } text-white`}
                        onClick={() => handleBanUnban(user._id, user.isBanned)}
                      >
                        {user.isBanned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsersList;