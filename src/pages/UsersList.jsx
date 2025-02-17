import React, { useEffect, useState } from "react";
import Header from "../components/Header";

const UsersList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token'); // Or get it from where you store the token
          const response = await fetch('http://localhost:5000/api/users/getAll', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // Attach token to the header
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          const data = await response.json();
          setUsers(data); // Update state with the fetched users
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      

    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once after the component mounts

  return (
    <>
      <Header />
      <div className="container mx-auto p-5">
        <h2 className="text-2xl font-semibold text-center mb-5">Users List</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th> {/* New Role Column */}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="text-center">
                  <td className="border p-2">{user.id}</td>
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.role}</td> {/* Display Role */}
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
