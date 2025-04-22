import React, { useEffect, useState } from "react";
import axios from "axios";
import LayoutTutorss from './LayoutTutorss';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = () => {
    axios.get(`/api/attendance`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((res) => setRecords(res.data))
    .catch((err) => console.error("Error fetching attendance records:", err));
  };

  const handleDelete = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        const response = await axios.delete(`/api/attendance/${recordId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        
        if (response.status === 200) {
          toast.success("Attendance record deleted successfully!");
          fetchAttendanceRecords();
        } else {
          toast.error("Failed to delete attendance record");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error("Attendance record not found");
        } else {
          toast.error("Failed to delete attendance record");
        }
        console.error("Error deleting attendance record:", error);
      }
    }
  };

  const handleEdit = (record) => {
    navigate(`/group-attendance`, { 
      state: { 
        groupId: record.group._id,
        sessionDate: record.sessionDate,
        attendanceId: record._id // Add the attendanceId for update
      } 
    });
  };

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const offset = currentPage * recordsPerPage;
  const currentRecords = records.slice(offset, offset + recordsPerPage);

  return (
    <LayoutTutorss>
      <div className="container mt-4">
        <h2>📋 Attendance History</h2>
        <ToastContainer />

        {currentRecords.map((record) => (
          <div key={record._id} className="border p-3 mb-4 rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>
                📅 {new Date(record.sessionDate).toLocaleDateString()} — 
                Group: <strong>{record.group?.name}</strong>
              </h5>
              <div>
                <button 
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(record)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(record._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <ul className="list-group">
              {(record.group?.members || []).map((member) => {
                const isPresent = record.presentMembers?.some(m => m._id === member._id);
                const isAbsent = record.absentMembers?.some(m => m._id === member._id);

                return (
                  <li
                    key={member._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {member.name} ({member.email})
                    {isPresent ? (
                      <span className="badge bg-primary">Present</span>  
                    ) : isAbsent ? (
                      <span className="badge bg-danger">Absent</span>  
                    ) : (
                      <span className="badge bg-secondary">Not Marked</span>  
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Pagination */}
        <div className="d-flex justify-content-center my-4">
          <button 
            className={`btn btn-outline-secondary me-2 ${currentPage === 0 ? 'disabled' : ''}`} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <button
            className={`btn btn-outline-secondary ${currentPage >= Math.ceil(records.length / recordsPerPage) - 1 ? 'disabled' : ''}`}
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(records.length / recordsPerPage) - 1}
          >
            Next
          </button>
        </div>
      </div>
    </LayoutTutorss>
  );
};

export default AttendanceHistory;
