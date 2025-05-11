import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import LayoutStudent from './LayoutStudent';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = "http://localhost:5000/api";

// Couleurs personnalisées douces
const colors = {
  primary: "#6c757d", // Gris doux
  success: "#d4efdf", // Vert doux
  danger: "#f5b7b1", // Rouge doux
  warning: "#fdebd0", // Jaune doux
  info: "#a9cce3", // Bleu doux
  light: "#f8f9fa", // Gris très clair
  dark: "#343a40", // Gris foncé
  muted: "#6c757d", // Gris moyen
  border: "#dee2e6" // Gris de bordure
};

const LoadingSpinner = () => (
  <div className="text-center py-5">
    <div className="spinner-border" style={{ color: colors.primary }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-2" style={{ color: colors.muted }}>Loading data...</p>
  </div>
);

const AttendanceDetailsCard = ({ record }) => {
  if (!record.group || !record.group.members || !record.sessionDate) {
    return (
      <div className="alert alert-light" style={{ border: `1px solid ${colors.border}` }}>
        No attendance data available for this session.
      </div>
    );
  }

  return (
    <div className="col-12 mb-3">
      <div className="card shadow-sm" style={{ borderColor: colors.border }}>
        <div className="card-header" style={{ 
          backgroundColor: colors.light,
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: '0.5rem' 
        }}>
            <div className="card-header py-2" style={{ /* Réduit le padding vertical */
          backgroundColor: colors.light,
          borderBottom: `1px solid ${colors.border}`
        }}></div>
          <h5 className="mb-0">
            <span className="badge me-2" style={{ 
              backgroundColor: colors.primary,
              color: "white",fontSize: '1rem' }}
           >
              {new Date(record.sessionDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <strong style={{ color: colors.dark }}>{record.group.name}</strong>
          </h5>
        </div>
        
        <div className="card-body p-2">
          <div className="row g-1">
            {/* Présents */}
            <div className="col-md-6 pe-1">
              <div className="card mb-2" style={{ 
                borderColor: colors.success,
                backgroundColor: `${colors.success}10` // 10% opacity
              }}>
                <div className="card-header" style={{ 
                  backgroundColor: colors.success,
                  color: "white"
                }}>
                  <h6 className="mb-0">
                    Present Members ({record.presentMembers?.length || 0})
                  </h6>
                </div>
                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    {record.presentMembers?.map((member) => (
                      <li key={member._id} className="list-group-item" style={{ 
                        borderColor: colors.border,
                        backgroundColor: "transparent"
                      }}>
                        <div className="d-flex align-items-center">
                          <span className="badge me-2" style={{ 
                            backgroundColor: colors.success,
                            color: "white"
                          }}>✓</span>
                          <div>
                            <strong style={{ color: colors.dark }}>{member.name}</strong>
                            <div className="small" style={{ color: colors.muted }}>{member.email}</div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Absents */}
            <div className="col-md-6">
              <div className="card mb-3" style={{ 
                borderColor: record.absentMembers?.some(a => a.isJustified) ? colors.warning : colors.danger,
                backgroundColor: record.absentMembers?.some(a => a.isJustified) ? 
                  `${colors.warning}10` : `${colors.danger}10`
              }}>
                <div className="card-header" style={{ 
                  backgroundColor: record.absentMembers?.some(a => a.isJustified) ? colors.warning : colors.danger,
                  color: "white"
                }}>
                  <h6 className="mb-0">
                    Absent Members ({record.absentMembers?.length || 0})
                  </h6>
                </div>
                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    {record.absentMembers?.map((absent) => (
                      <li 
                        key={absent.member._id} 
                        className="list-group-item" 
                        style={{ 
                          borderColor: colors.border,
                          backgroundColor: absent.isJustified ? `${colors.warning}15` : `${colors.danger}15`
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <span className="badge me-2" style={{ 
                            backgroundColor: absent.isJustified ? colors.warning : colors.danger,
                            color: absent.isJustified ? colors.dark : "white"
                          }}>
                            {absent.isJustified ? '⚠' : '✗'}
                          </span>
                          <div>
                            <strong style={{ color: colors.dark }}>{absent.member.name}</strong>
                            <div className="small" style={{ color: colors.muted }}>{absent.member.email}</div>
                            {absent.isJustified && (
                              <div className="mt-1">
                                <span className="badge me-1" style={{ 
                                  backgroundColor: colors.info,
                                  color: "white"
                                }}>
                                  Justification
                                </span>
                                <small style={{ color: colors.muted }}>{absent.justification}</small>
                              </div>
                            )}
                            <div className="mt-1">
                              <span className="badge me-1" style={{ 
                                backgroundColor: colors.primary,
                                color: "white"
                              }}>
                             
                              </span>
                              <small style={{ color: colors.muted }}>{absent.followUpType}</small>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer small" style={{ 
          backgroundColor: colors.light,
          borderTop: `1px solid ${colors.border}`,
          color: colors.muted
        }}>
          <div className="d-flex justify-content-between">
            <div>
              <strong>Session created by:</strong> {record.createdBy?.name || 'Unknown'}
            </div>
            <div>
              <strong>Last updated:</strong> {new Date(record.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AttendanceDetailsCard.propTypes = {
  record: PropTypes.object.isRequired
};

const AttendancePerStudent = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const [dateFilter, setDateFilter] = useState(null);
  const [showAll, setShowAll] = useState(true);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); // Add this before the API call
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetchWithErrorHandling(
          () => axios.get(`${API_BASE_URL}/groups/my-group`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          "Error fetching groups"
        );
      
        setUserGroups(response.data);
        if (response.data.length > 0) {
          setSelectedGroup(response.data[0]);
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

  useEffect(() => {
    if (!selectedGroup) return;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [attendanceResponse] = await Promise.all([
          fetchWithErrorHandling(
            () => axios.get(`${API_BASE_URL}/attendance/group/${selectedGroup._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            "Error fetching attendance data"
          ),
          fetchWithErrorHandling(
            () => axios.get(`${API_BASE_URL}/attendance/group/${selectedGroup._id}/stats`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }),
            "Error fetching statistics"
          )
        ]);
        
        setAttendanceData(attendanceResponse.data);
        setFilteredData(attendanceResponse.data);
       
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedGroup]);

  useEffect(() => {
    if (!dateFilter || showAll) {
      setFilteredData(attendanceData);
    } else {
      const filtered = attendanceData.filter(record => {
        const recordDate = new Date(record.sessionDate).toDateString();
        const selectedDate = new Date(dateFilter).toDateString();
        return recordDate === selectedDate;
      });
      setFilteredData(filtered);
    }
  }, [dateFilter, attendanceData, showAll]);

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    const group = userGroups.find(g => g._id === groupId);
    setSelectedGroup(group);
  };

  const handleDateChange = (date) => {
    setDateFilter(date);
    setShowAll(false);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setDateFilter(null);
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
      <div className="container mt-2">
        <h2 className="mb-4">📋 Detailed Attendance Records</h2>
        <ToastContainer position="top-right" autoClose={5000} />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label htmlFor="groupSelect" className="form-label">Select Group</label>
                <select 
                  id="groupSelect" 
                  className="form-select"
                  value={selectedGroup?._id || ''}
                  onChange={handleGroupChange}
                >
                  {userGroups.map(group => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="dateFilter" className="form-label">Filter by Date</label>
                <div className="input-group">
                  <DatePicker
                    id="dateFilter"
                    selected={dateFilter}
                    onChange={handleDateChange}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date to filter"
                    isClearable
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={handleShowAll}
                  >
                    Show All
                  </button>
                </div>
              </div>
            </div>

           
            {filteredData.length === 0 ? (
              <div className="alert alert-info text-center">
                {dateFilter 
                  ? `No attendance records found for ${new Date(dateFilter).toLocaleDateString()}`
                  : "No attendance records found for this group"}
              </div>
            ) : (
              <div className="row">
                {filteredData.map((record) => (
                  <AttendanceDetailsCard key={record._id} record={record} />
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