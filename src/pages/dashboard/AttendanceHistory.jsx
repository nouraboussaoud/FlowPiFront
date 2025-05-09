import React, { useEffect, useState } from "react";
import axios from "axios";
import LayoutTutorss from './LayoutTutorss';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import * as bootstrap from 'bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [stats, setStats] = useState(null);
  const [modalGroupName, setModalGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const recordsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, dateFilter, statusFilter]);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setRecords(response.data);
    } catch (err) {
      toast.error("Error fetching attendance records");
      console.error("Error fetching attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let result = [...records];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(record => 
        record.group?.name.toLowerCase().includes(term) ||
        record.presentMembers.some(m => m.name.toLowerCase().includes(term)) ||
        record.absentMembers.some(m => m.member.name.toLowerCase().includes(term)))
    }

    // Apply date filter
    if (dateFilter.startDate) {
      const start = new Date(dateFilter.startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(record => 
        new Date(record.sessionDate) >= start
      );
    }

    if (dateFilter.endDate) {
      const end = new Date(dateFilter.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(record => 
        new Date(record.sessionDate) <= end
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(record => {
        if (statusFilter === "present") {
          return record.presentMembers.length > 0;
        } else if (statusFilter === "absent") {
          return record.absentMembers.length > 0;
        }
        return true;
      });
    }

    setFilteredRecords(result);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleDelete = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:5000/api/attendance/${recordId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        
        if (response.status === 200) {
          toast.success("Attendance record deleted successfully!");
          fetchAttendanceRecords();
        } else {
          toast.error("Failed to delete attendance record");
        }
      } catch (error) {
        toast.error("Failed to delete attendance record");
        console.error("Error deleting attendance record:", error);
      }
    }
  };

  const handleEdit = (record) => {
    navigate(`/group-attendance`, { 
      state: { 
        groupId: record.group._id,
        sessionDate: record.sessionDate,
        attendanceId: record._id
      } 
    });
  };

  const handleShowStats = async (groupId, groupName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance/group/${groupId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      setStats(response.data);
      setModalGroupName(groupName);
      new bootstrap.Modal(document.getElementById("statsModal")).show();
    } catch (error) {
      toast.error("Failed to fetch statistics");
      console.error("Stats error:", error);
    }
  };

 

  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter({ startDate: null, endDate: null });
    setStatusFilter("all");
  };

  const offset = currentPage * recordsPerPage;
  const currentRecords = filteredRecords.slice(offset, offset + recordsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <LayoutTutorss>
      <div className="container mt-4">
        <h2 className="mb-4">📋 Attendance History</h2>
        <ToastContainer />

        {/* Filters Section */}
<div className="card mb-4">
  <div className="card-header bg-light">
    <h5>🔍 Filters</h5>
  </div>
  <div className="card-body">
    <div className="row g-3"> {/* Ajout de g-3 pour un espacement égal entre les colonnes */}
      <div className="col-md-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by group or member"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="col-md-3">
        <DatePicker
          selected={dateFilter.startDate}
          onChange={(date) => setDateFilter({ ...dateFilter, startDate: date })}
          className="form-control"
          placeholderText="Start Date"
          dateFormat="yyyy-MM-dd"
          isClearable
        />
      </div>
      <div className="col-md-3">
        <DatePicker
          selected={dateFilter.endDate}
          onChange={(date) => setDateFilter({...dateFilter, endDate: date})}
          className="form-control"
          placeholderText="End Date"
          dateFormat="yyyy-MM-dd"
          isClearable
          minDate={dateFilter.startDate}
        />
      </div>
      <div className="col-md-2 d-flex align-items-end">
        <button 
          className="btn btn-outline-secondary w-100"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>
    </div>
  </div>
</div>
        {/* Results Count */}
      

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="alert alert-warning">No records found matching your criteria</div>
        ) : (
          <>
            {currentRecords.map((record) => (
              <div key={record._id} className="card mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <span className="badge bg-secondary me-2">
                      {new Date(record.sessionDate).toLocaleDateString()}
                    </span>
                    <strong>{record.group?.name}</strong>
                  </h5>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(record)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger me-2"
                      onClick={() => handleDelete(record._id)}
                    >
                      Delete
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-info me-2"
                      onClick={() => handleShowStats(record.group._id, record.group.name)}
                    >
                      Stats
                    </button>
                  
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Present Members ({record.presentMembers.length})</h6>
                      <ul className="list-group mb-3">
                        {record.presentMembers.map((member) => (
                          <li key={member._id} className="list-group-item">
                            {member.name} ({member.email})
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6>Absent Members ({record.absentMembers.length})</h6>
                      <ul className="list-group">
                        {record.absentMembers.map((absent) => (
                          <li 
                            key={absent.member._id} 
                            className={`list-group-item ${absent.isJustified ? 'list-group-item-warning' : 'list-group-item-danger'}`}
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                {absent.member.name} ({absent.member.email})
                              </div>
                              <div>
                                {absent.isJustified && (
                                  <span className="badge bg-info text-dark me-2">
                                    Justified: {absent.justification}
                                  </span>
                                )}
                                <span className="badge bg-secondary">
                                  {absent.followUpType}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-footer text-muted">
                  Created by: {record.createdBy?.name || 'Unknown'} • 
                  Last modified: {new Date(record.updatedAt).toLocaleString()}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                  <button 
                  className="page-link px-4 bg-secondary text-white border-secondary"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  >
                    Previous
                  </button>
                </li>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <li 
                    key={i} 
                    className={`page-item ${currentPage === i ? 'active' : ''}`}
                  >
                    <button 
                     className={`page-link px-4 ${currentPage === i ? 'bg-dark text-white' : 'bg-light text-dark border-light'}`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                  <button 
                   className="page-link px-5 bg-secondary text-white border-secondary" 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}

       {/* Stats Modal */}
<div className="modal fade" id="statsModal" tabIndex="-1" aria-hidden="true">
  <div className="modal-dialog modal-xl modal-dialog-scrollable">
    <div className="modal-content">
    <div className="modal-header bg-info"> {/* bg-info est plus proche de #a9cce3 que bg-primary */}
  <h5 className="modal-title text-dark">
    📊 Statistics for Group: {modalGroupName}
  </h5>
  <button 
    type="button" 
    className="btn-close" 
    data-bs-dismiss="modal"
  ></button>
</div>
      <div className="modal-body">
        {stats ? (
          <div>
            {/* Tableau principal des stats */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Member</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Normal Follow-up (Unjustified)</th>
                    <th>Validation Day (Unjustified)</th>
                    <th>Justified Absences</th>
                    <th>Total Sessions</th>
                    <th>% Presence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((member, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="d-flex align-items-center">
                          {member.profilePic && (
                            <img 
                              src={member.profilePic.includes('http') ? member.profilePic : `http://localhost:5000/uploads/${member.profilePic}`}
                              alt={member.name} 
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = '/default-profile.png';
                              }}
                            />
                          )}
                          <div>
                            <div>{member.name}</div>
                            <small className="text-muted">{member.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{member.present}</td>
                      <td>{member.absent}</td>
                      <td className="text-danger">{member.normalFollowUpAbsences}</td>
                      <td className="text-danger">{member.validationDayAbsences}</td>
                      <td className="text-warning">{member.justifiedAbsences}</td>
                      <td>{member.totalSessions}</td>
                      <td>
                        {member.totalSessions > 0 ? (
                          <div className="progress" style={{ height: "20px" }}>
                            <div 
                              className="progress-bar bg-success" 
                              role="progressbar" 
                              style={{ width: `${member.presencePercentage}%` }}
                              aria-valuenow={member.presencePercentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {member.presencePercentage}%
                            </div>
                          </div>
                        ) : "N/A"}
                      </td>
                      <td>
                        {member.totalSessions > 0 && (
                          <span className={`badge ${
                            member.presencePercentage >= 80 ? 'bg-success' :
                            member.presencePercentage >= 50 ? 'bg-warning text-dark' : 'bg-danger'
                          }`}>
                            {member.totalSessions > 0 ? (
                              member.presencePercentage >= 80 ? 'Excellent' :
                              member.presencePercentage >= 50 ? 'Fair' : 'Poor'
                            ) : 'N/A'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Détails des absences par membre */}
            <h5 className="mb-3">Absence Details</h5>
            {stats.map((member, idx) => (
              member.absent > 0 && (
                <div key={`details-${idx}`} className="card mb-3">
                  <div className="card-header">
                    <h6>
                      {member.name} - {member.absent} absence(s)
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Follow-up Type</th>
                            <th>Justification</th>
                          </tr>
                        </thead>
                        <tbody>
                          {member.absenceDetails.map((absence, aIdx) => (
                            <tr 
                              key={`absence-${idx}-${aIdx}`}
                              className={absence.isJustified ? 'table-warning' : 'table-danger'}
                            >
                              <td>{new Date(absence.date).toLocaleDateString()}</td>
                              <td>
                                {absence.isJustified ? 
                                  <span className="badge bg-warning text-dark">Justified</span> : 
                                  <span className="badge bg-danger">Unjustified</span>
                                }
                              </td>
                              <td>{absence.followUpType}</td>
                              <td>{absence.justification || 'No justification'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <p>Loading statistics...</p>
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
          Close
        </button>
      </div>
    </div>
  </div>
</div>
       
      </div>
      
    </LayoutTutorss>
  );
};

export default AttendanceHistory;