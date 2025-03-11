import { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from "./ChatBox";

const UsersTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/users/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter students
        const studentUsers = response.data.filter(user => user.role === "student");
        setStudents(studentUsers);
      } catch (err) {
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleViewDetails = (userId) => {
    console.log("Viewing details for user:", userId);
  };

  const handleOpenUpdateModal = (user) => {
    console.log("Editing user:", user);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(students.filter(student => student._id !== userId));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/toggle-status`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(students.map(student => 
        student._id === userId ? { ...student, isActive: response.data.isActive } : student
      ));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleBanUnban = async (userId, isBanned) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/ban-unban`,
        { isBanned: !isBanned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(students.map(student => 
        student._id === userId ? { ...student, isBanned: response.data.isBanned } : student
      ));
    } catch (error) {
      console.error("Error banning/unbanning student:", error);
    }
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Student List</h2>
      <div className="table-responsive">
        <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
          <thead>
            <tr>
              <th scope="col" className="border-0 rounded-start">Name</th>
              <th scope="col" className="border-0">Email</th>
              <th scope="col" className="border-0">Role</th>
              <th scope="col" className="border-0">Status</th>
              <th scope="col" className="border-0 rounded-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>
                  <div className="d-flex align-items-center position-relative">
                    <div className="avatar avatar-md">
                      <img
                        src={student.profilePic ? `http://localhost:5000/uploads/${student.profilePic}` : "assets/images/avatar/01.jpg"}
                        className="rounded-circle"
                        alt="Student Avatar"
                        width="40"
                        height="40"
                      />
                    </div>
                    <div className="mb-0 ms-3">
                      <h6 className="mb-0">
                        <a href="#" className="stretched-link">{student.name}</a>
                      </h6>
                    </div>
                  </div>
                </td>
                <td>{student.email || "N/A"}</td>
                <td>{student.role}</td>
                <td>{student.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-light btn-round me-1"
                    title="View Details"
                    onClick={() => handleViewDetails(student._id)}
                  >
                    <i className="bi bi-eye" />
                  </button>
                  <button
                    className="btn btn-sm btn-light btn-round me-1"
                    title="Edit"
                    onClick={() => handleOpenUpdateModal(student)}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="btn btn-sm btn-light btn-round me-1"
                    title="Delete"
                    onClick={() => handleDeleteUser(student._id)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                  <button
                    className="btn btn-sm btn-light btn-round me-1"
                    title={student.isActive ? "Deactivate" : "Activate"}
                    onClick={() => handleToggleStatus(student._id, student.isActive)}
                  >
                    <i className={`bi bi-toggle-${student.isActive ? "on" : "off"}`} />
                  </button>
                  <button
                    className="btn btn-sm btn-light btn-round me-1"
                    title="Chat"
                    onClick={() => setChatUser(student)}
                  >
                    <i className="bi bi-chat-dots" />
                  </button>
                  <button
                    className={`btn btn-sm ${student.isBanned ? "btn-danger" : "btn-success"} btn-round`}
                    title={student.isBanned ? "Unban" : "Ban"}
                    onClick={() => handleBanUnban(student._id, student.isBanned)}
                  >
                    {student.isBanned ? "Unban" : "Ban"}
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {chatUser && (
        <ChatBox user={chatUser} onClose={() => setChatUser(null)} />
      )}
    </div>
  );
};

export default UsersTable;
