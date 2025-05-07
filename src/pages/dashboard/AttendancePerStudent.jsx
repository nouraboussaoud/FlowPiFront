import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import LayoutStudent from './LayoutStudent';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

// API configuration
const API_BASE_URL = "http://localhost:5000/api";

// Helper component for loading state
const LoadingSpinner = () => (
  <div className="text-center">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p>Loading data...</p>
  </div>
);

// Helper component for displaying attendance card
const AttendanceCard = ({ record }) => {
  // Check if record.group and record.group.members are defined before using .map
  if (!record.group || !record.group.members || !record.sessionDate) {
    return (
      <div className="alert alert-warning">
        No attendance data available for this group.
      </div>
    );
  }

  return (
    <div className="col-md-6 mb-4">
      <div className="card shadow-sm">
        <div className="card-header">
          <h5>
            📅 {new Date(record.sessionDate).toLocaleDateString()} — Group:{" "}
            <strong>{record.group?.name || 'Unknown group'}</strong>
          </h5>
        </div>
        <div className="card-body">
          <ul className="list-group">
            {record.group.members.map((member) => {
              // Check if the member is present or absent
              const isPresent = record.presentMembers?.some(m => m._id === member._id);
              const isAbsent = record.absentMembers?.some(m => m._id === member._id);

              return (
                <li
                  key={member._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {member.name} ({member.email})
                  {isPresent ? (
                    <span className="badge bg-success">Present</span>
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
      </div>
    </div>
  );
};

AttendanceCard.propTypes = {
  record: PropTypes.object.isRequired
};

const AttendancePerStudent = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data with error handling
  const fetchWithErrorHandling = async (fetchFn, errorMessage) => {
    try {
      return await fetchFn();
    } catch (error) {
      console.error(errorMessage, error);
      toast.error(errorMessage);
      setError(errorMessage);
      throw error;
    }
  };

  // Fetch logged-in student data and groups
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user's groups
        const response = await fetchWithErrorHandling(
          () => axios.get(`${API_BASE_URL}/groups/my-group`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          "Error fetching groups"
        );
      
        setUserGroups(response.data);
        if (response.data.length > 0) {
          setSelectedGroup(response.data[0]);  // Automatically select the first group if available
        } else {
          toast.info("You are not a member of any groups.");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch attendance data for selected group
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetchWithErrorHandling(
          () => axios.get(`${API_BASE_URL}/attendance/group/${selectedGroup._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          "No attendance data available"
        );
        setAttendanceData(response.data);
      } catch (error) {
        console.error("No attendance data available:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedGroup]);

  const handleGroupSelect = (e) => {
    const selectedGroupId = e.target.value;
    const group = userGroups.find(g => g._id === selectedGroupId);
    setSelectedGroup(group);
  };

  if (error) {
    return (
      <LayoutStudent>
        <div className="container mt-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </LayoutStudent>
    );
  }

  return (
    <LayoutStudent>
      <div className="container mt-5">
        <h2 className="mb-4">Student Attendance Per Date</h2>
        <ToastContainer position="top-right" autoClose={5000} />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Group selection dropdown */}
            {userGroups.length > 0 && (
              <div className="mb-4">
                <label htmlFor="groupSelect" className="form-label">Select Group:</label>
                <select
                  id="groupSelect"
                  className="form-select"
                  onChange={handleGroupSelect}
                  value={selectedGroup?._id || ""}
                  aria-label="Select group to view attendance"
                >
                  <option value="">-- Select a Group --</option>
                  {userGroups.map(group => (
                    <option key={group._id} value={group._id}>
                      {group.name} 
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Display attendance data for the selected group */}
            {!selectedGroup ? (
              <div className="alert alert-info text-center">Please select a group to view attendance</div>
            ) : attendanceData.length === 0 ? (
              <div className="alert alert-info text-center">No attendance records found for this group.</div>
            ) : (
              <div className="row">
                {attendanceData.map((record) => (
                  <AttendanceCard key={record._id} record={record} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </LayoutStudent>
  );
};

export default AttendancePerStudent;
