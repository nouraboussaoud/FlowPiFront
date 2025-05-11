import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal, Button } from 'react-bootstrap';
import debounce from 'lodash.debounce';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AttendanceHistoryAdmin = () => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [stats, setStats] = useState(null);
  const [modalGroupName, setModalGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [buttonLoading, setButtonLoading] = useState({});
  const recordsPerPage = 5;
  const navigate = useNavigate();

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(response.data);
    } catch (err) {
      toast.error("Error fetching attendance records");
      console.error("Error fetching attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  // Filter function
  const filterRecords = useCallback((recordsToFilter, term, dateFilter, status) => {
    const searchTermLower = term.toLowerCase();
    const startDate = dateFilter.startDate ? new Date(dateFilter.startDate).setHours(0, 0, 0, 0) : null;
    const endDate = dateFilter.endDate ? new Date(dateFilter.endDate).setHours(23, 59, 59, 999) : null;

    return recordsToFilter.filter((record) => {
      // Search term filter
      const matchesSearch = !searchTermLower ||
        record.group?.name?.toLowerCase().includes(searchTermLower) ||
        record.presentMembers?.some((m) => m.name?.toLowerCase().includes(searchTermLower)) ||
        record.absentMembers?.some((m) => m.member?.name?.toLowerCase().includes(searchTermLower));

      // Date filter
      const sessionDate = record.sessionDate ? new Date(record.sessionDate).getTime() : null;
      const matchesDate = (!startDate || (sessionDate && sessionDate >= startDate)) &&
                         (!endDate || (sessionDate && sessionDate <= endDate));

      // Status filter
      const matchesStatus = status === "all" ||
        (status === "present" && record.presentMembers?.length > 0) ||
        (status === "absent" && record.absentMembers?.length > 0);

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, []);

  // Memoize filtered records
  const filteredRecords = useMemo(() => {
    return filterRecords(records, searchTerm, dateFilter, statusFilter);
  }, [records, searchTerm, dateFilter, statusFilter, filterRecords]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filteredRecords]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Handle stats modal
  const handleShowStats = async (groupId, groupName) => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance/group/${groupId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
      setModalGroupName(groupName);
      setShowStatsModal(true);
    } catch (error) {
      toast.error("Failed to fetch statistics");
      console.error("Error:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle delete with loading state
  const handleDelete = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      setButtonLoading((prev) => ({ ...prev, [recordId]: true }));
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:5000/api/attendance/${recordId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200) {
          toast.success("Attendance record deleted successfully!");
          fetchAttendanceRecords();
        }
      } catch (error) {
        toast.error("Failed to delete attendance record");
        console.error("Error deleting attendance record:", error);
      } finally {
        setButtonLoading((prev) => ({ ...prev, [recordId]: false }));
      }
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    navigate(`/AttendaceFormAdmin`, {
      state: {
        groupId: record.group?._id,
        sessionDate: record.sessionDate,
        attendanceId: record._id,
      },
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter({ startDate: null, endDate: null });
    setStatusFilter("all");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!stats) return;

    try {
        const doc = new jsPDF({
      orientation: 'landscape'
    });

    // Title
    doc.setFontSize(18);
    doc.text(`Attendance Statistics for Group: ${modalGroupName}`, 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Main stats table
    const headers = [
      'Member',
      'Email', // Nouvelle colonne pour l'email
      'Present',
      'Absent',
      'Normal Follow-up',
      'Validation Day',
      'Justified',
      'Total',
      '% Presence',
      'Status'
    ];

    const data = stats.map(member => [
      member.name,
      member.email || 'N/A', // Ajout de l'email
      member.present,
      member.absent,
      member.normalFollowUpAbsences,
      member.validationDayAbsences,
      member.justifiedAbsences,
      member.totalSessions,
      member.totalSessions > 0 ? `${member.presencePercentage}%` : 'N/A',
      member.totalSessions > 0 
        ? member.presencePercentage >= 80 
          ? "Excellent" 
          : member.presencePercentage >= 50 
            ? "Fair" 
            : "Poor"
        : 'N/A'
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 'auto' }
      }
    });

    // Add absence details for each member
    
    
    let yPos = doc.lastAutoTable.finalY + 10;
    
    stats.forEach(member => {
      if (member.absent > 0) {
        // Member title with photo if available
        doc.setFontSize(12);
        
        // Ajouter la photo si disponible
        if (member.profilePic) {
          try {
            const imgData = member.profilePic.includes("http") 
              ? member.profilePic 
              : `http://localhost:5000/uploads/${member.profilePic}`;
            
            // Add small profile image (10x10 mm)
            doc.addImage(imgData, 'JPEG', 14, yPos, 10, 10);
            doc.text(`${member.name} - ${member.absent} absence(s)`, 26, yPos + 7);
            yPos += 15; // Plus d'espace pour l'image
          } catch (error) {
            console.error('Error adding image:', error);
            doc.text(`${member.name} - ${member.absent} absence(s)`, 14, yPos);
            yPos += 7;
          }
        } else {
          doc.text(`${member.name} - ${member.absent} absence(s)`, 14, yPos);
          yPos += 7;
        }

        // Absence details table - updated to include email
        const absenceHeaders = [
          'Date', 
          'Status', 
          'Follow-up Type', 
          'Justification',
          'Email' // Nouvelle colonne
        ];
        
        const absenceData = member.absenceDetails.map(absence => [
          absence.date ? new Date(absence.date).toLocaleDateString() : 'N/A',
          absence.isJustified ? 'Justified' : 'Unjustified',
          absence.followUpType || 'N/A',
          absence.justification || 'No justification',
          member.email || 'N/A' // Ajout de l'email
        ]);

        autoTable(doc, {
          head: [absenceHeaders],
          body: absenceData,
          startY: yPos,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 10;
        
        // Add page break if we're getting close to the bottom
        if (yPos > 180) {
          doc.addPage();
          yPos = 20;
        }
      }
    });

    // Save the PDF
    doc.save(`Attendance_Stats_${modalGroupName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
  }
};
  // Pagination calculations
  const offset = currentPage * recordsPerPage;
  const currentRecords = filteredRecords.slice(offset, offset + recordsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <DashboardLayout>
      <style>
    {`
      /* Custom width for the modal */
      .modal-90w {
        max-width: 100% !important; /* Increase width to 90% of the screen */
        width: 90% !important;
      }

      /* Ensure the modal is centered */
      .modal-dialog-centered {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }

      /* For the header fixed during scroll */
      .table-responsive {
        position: relative;
      }

      .sticky-top {
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
      }

      /* For the first column fixed during horizontal scroll */
      .sticky-cell {
        position: sticky;
        left: 0;
        background: white;
        z-index: 5;
      }

      /* Ensure modal content is scrollable and fits well */
      .modal-body {
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        padding: 20px;
        width: 100% !important;
      }
    `}
  </style>
     
      <div className="container mt-4">
      <br></br>
        <h2 className="mb-4">📋 Attendance History</h2>
        <br></br>
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Filters Section */}
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5>🔍 Filters</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by group or member"
                  onChange={handleSearchChange}
                  defaultValue={searchTerm}
                />
              </div>
              <div className="col-md-2">
              <DatePicker
                selected={dateFilter.startDate}
                onChange={(date) => setDateFilter({ ...dateFilter, startDate: date })}
                className="form-control"
                placeholderText="Start Date"
                dateFormat="yyyy-MM-dd"
                isClearable
                selectsStart
                startDate={dateFilter.startDate}
                endDate={dateFilter.endDate}
                popperPlacement="top-start"
              />
              </div>
              <div className="col-md-2">
              <DatePicker
                selected={dateFilter.endDate}
                onChange={(date) => setDateFilter({ ...dateFilter, endDate: date })}
                className="form-control"
                placeholderText="End Date"
                dateFormat="yyyy-MM-dd"
                isClearable
                selectsEnd
                startDate={dateFilter.startDate}
                endDate={dateFilter.endDate}
                minDate={dateFilter.startDate}
                popperPlacement="top-start"
              />
              </div>
              
              <div className="col-md-3 d-flex align-items-end">
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

        {/* Results count */}
        <div className="mb-3">
          Showing {filteredRecords.length} record(s)
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* No records found */}
        {!loading && filteredRecords.length === 0 && (
          <div className="alert alert-warning">No records found matching your criteria</div>
        )}

        {/* Records list */}
        {!loading && filteredRecords.length > 0 && (
          <>
            {currentRecords.map((record) => (
              <div key={record._id} className="card mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <span className="badge bg-secondary me-2">
                      {record.sessionDate ? new Date(record.sessionDate).toLocaleDateString() : 'No date'}
                    </span>
                    <strong>{record.group?.name || "Unknown Group"}</strong>
                  </h5>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(record)}
                      disabled={buttonLoading[record._id]}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger me-2"
                      onClick={() => handleDelete(record._id)}
                      disabled={buttonLoading[record._id]}
                    >
                      {buttonLoading[record._id] ? (
                        <span className="spinner-border spinner-border-sm" role="status" />
                      ) : (
                        'Delete'
                      )}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleShowStats(record.group?._id, record.group?.name || "Unknown Group")}
                      disabled={statsLoading}
                    >
                      {statsLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" />
                      ) : (
                        'Stats'
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Present Members ({record.presentMembers?.length || 0})</h6>
                      <ul className="list-group mb-3">
                        {record.presentMembers?.map((member) => (
                          <li key={member._id} className="list-group-item">
                            {member.name} ({member.email})
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6>Absent Members ({record.absentMembers?.length || 0})</h6>
                      <ul className="list-group">
                        {record.absentMembers?.map((absent) => (
                          <li
                            key={absent.member?._id}
                            className={`list-group-item ${absent.isJustified ? 'list-group-item-warning' : 'list-group-item-danger'}`}
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                {absent.member?.name} ({absent.member?.email})
                              </div>
                              <div>
                                {absent.isJustified && (
                                  <span className="badge bg-info text-dark me-2">
                                    Justified: {absent.justification}
                                  </span>
                                )}
                                <span className="badge bg-secondary">{absent.followUpType}</span>
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
                  Last modified: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'Unknown'}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                  <button
  className="page-link"
  onClick={() => setCurrentPage(prev => prev + 1)}
  disabled={currentPage >= totalPages - 1}
  style={{ width: '90px' }} // ou toute autre valeur
>
  Next
</button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}

        {/* Stats Modal */}
        <Modal
         show={showStatsModal}
         onHide={() => setShowStatsModal(false)}
         size="xl"
         scrollable
         centered
         dialogClassName="modal-90w modal-dialog-centered" // Use the custom class for width
         contentClassName="mx-auto"
         style={{ display: 'flex', alignItems: 'center', zIndex: 1050, justifyContent: 'center' }}
       >
          <Modal.Header closeButton className="bg-info text-dark">
            <Modal.Title>
              📊 Statistics for Group: {modalGroupName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
      {statsLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
            ) : stats ? (
              <div className="container-fluid">
                {/* Tableau principal des stats */}
                <div className="table-responsive mb-4" style={{ fontSize: '0.9rem' }}>
                  <table className="table table-bordered table-hover">
                    {/* En-têtes du tableau */}
                    <thead className="table-light sticky-top" style={{ top: '-1px' }}>
                      <tr>
                        <th style={{ minWidth: '200px' }}>Member</th>
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
                          <td style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                            <div className="d-flex align-items-center">
                              {member.profilePic && (
                                <img
                                  src={
                                    member.profilePic.includes("http")
                                      ? member.profilePic
                                      : `http://localhost:5000/uploads/${member.profilePic}`
                                  }
                                  alt={member.name}
                                  className="rounded-circle me-2"
                                  width="30"
                                  height="30"
                                 
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
                              <div className="d-flex align-items-center">
                                <div className="progress flex-grow-1" style={{ height: "20px" }}>
                                  <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{ width: `${member.presencePercentage}%` }}
                                    aria-valuenow={member.presencePercentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  />
                                </div>
                                <span className="ms-2">{member.presencePercentage}%</span>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td>
                            {member.totalSessions > 0 && (
                              <span
                                className={`badge ${
                                  member.presencePercentage >= 80
                                    ? "bg-success"
                                    : member.presencePercentage >= 50
                                    ? "bg-warning text-dark"
                                    : "bg-danger"
                                }`}
                              >
                                {member.presencePercentage >= 80
                                  ? "Excellent"
                                  : member.presencePercentage >= 50
                                  ? "Fair"
                                  : "Poor"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h5 className="mb-3">Absence Details</h5>
                {stats.map((member, idx) =>
                  member.absent > 0 ? (
                    <div key={`details-${idx}`} className="card mb-3">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          {member.name} - {member.absent} absence(s)
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered mb-0">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Follow-up Type</th>
                                <th>Justification</th>
                              </tr>
                            </thead>
                            <tbody>
                              {member.absenceDetails?.map((absence, aIdx) => (
                                <tr key={`absence-${idx}-${aIdx}`} className={absence.isJustified ? "table-warning" : "table-danger"}>
                                  <td>{absence.date ? new Date(absence.date).toLocaleDateString() : 'N/A'}</td>
                                  <td>
                                    {absence.isJustified ? (
                                      <span className="badge bg-warning text-dark">Justified</span>
                                    ) : (
                                      <span className="badge bg-danger">Unjustified</span>
                                    )}
                                  </td>
                                  <td>{absence.followUpType || 'N/A'}</td>
                                  <td>{absence.justification || "No justification"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No statistics available</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <div>
            
              <Button variant="outline-primary" onClick={exportToPDF}>
                <i className="bi bi-download me-2"></i>Export PDF
              </Button>
            </div>
            <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      </DashboardLayout>
  );
};

export default AttendanceHistoryAdmin;