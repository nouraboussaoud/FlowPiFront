import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";
import LayoutTutor from "./LayoutTutorss";

const GroupAttendance = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [sessionDate, setSessionDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [absentDetails, setAbsentDetails] = useState({});

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/groups/getAllGroups", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch groups");
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        toast.error(error.message);
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  // Handle pre-filling of attendance
  useEffect(() => {
    if (location.state) {
      const { groupId, sessionDate } = location.state;
      const group = groups.find((g) => g._id === groupId);
      if (group) {
        setSelectedGroup(group);
        setSessionDate(new Date(sessionDate));
        fetchExistingAttendance(groupId, sessionDate);
      }
    }
  }, [location.state, groups]);

  // Initialize absentDetails when group changes
  useEffect(() => {
    if (selectedGroup) {
      const initialDetails = {};
      selectedGroup.members.forEach(member => {
        initialDetails[member._id] = {
          isJustified: false,
          justification: "",
          followUpType: "Normal follow-up day",
       
        };
      });
      setAbsentDetails(initialDetails);
    }
  }, [selectedGroup]);

  const fetchExistingAttendance = async (groupId, date) => {
    try {
      const token = localStorage.getItem("token");
      const formattedDate = new Date(date).toISOString().split('T')[0];
  
      const response = await fetch(
        `http://localhost:5000/api/attendance/group/${groupId}/date/${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        
        if (data.exists && data.data) {
          const existingAttendance = data.data;
          setSelectedGroup(prev => ({
            ...prev,
            members: prev.members.map(member => ({
              ...member,
              attendanceStatus: 
                existingAttendance.presentMembers?.some(m => m._id === member._id)
                  ? "present"
                  : "absent",
            })),
          }));
  
          if (existingAttendance.absentMembers) {
            const updatedDetails = {...absentDetails};
            existingAttendance.absentMembers.forEach(absent => {
              if (absent.member && updatedDetails[absent.member._id]) {
                updatedDetails[absent.member._id] = {
                  isJustified: absent.isJustified || false,
                  justification: absent.justification || "",
                  followUpType: absent.followUpType || "Normal follow-up day"
                };
              }
            });
            setAbsentDetails(updatedDetails);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching existing attendance:", error);
    }
  };
  const handleGroupSelect = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    setSelectedGroup(group);
  };

  const handleAttendanceChange = (memberId, isPresent) => {
    setSelectedGroup(prev => ({
      ...prev,
      members: prev.members.map(member => {
        if (member._id === memberId) {
          return { ...member, attendanceStatus: isPresent ? "present" : "absent" };
        }
        return member;
      }),
    }));
  };

  const handleAbsenceDetailChange = (memberId, field, value) => {
    setAbsentDetails(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const submitAttendance = async () => {
    if (!selectedGroup) return;
  
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Formatage cohérent de la date
      const formattedDate = new Date(sessionDate).toISOString().split('T')[0];
      const isoDate = new Date(sessionDate).toISOString();
  
      const presentMembers = selectedGroup.members
        .filter(member => member.attendanceStatus === "present")
        .map(member => member._id);
  
        const absentMembers = selectedGroup.members
        .filter(member => member.attendanceStatus === "absent")
        .map(member => ({
          member: member._id,
          isJustified: absentDetails[member._id]?.isJustified || false,
          justification: absentDetails[member._id]?.justification || "",
          followUpType: absentDetails[member._id]?.followUpType || "Normal follow-up day"
        }));
  
      // Vérification existence avec date formatée
      const checkResponse = await fetch(
        `http://localhost:5000/api/attendance/group/${selectedGroup._id}/date/${formattedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      let existingAttendance = null;
      if (checkResponse.ok) {
        const { exists, data } = await checkResponse.json();
        existingAttendance = exists ? data : null;
      }
  
     
  
      const response = await fetch(
        existingAttendance?._id 
          ? `http://localhost:5000/api/attendance/update/${existingAttendance._id}`
          : `http://localhost:5000/api/attendance/group/${selectedGroup._id}`,
        {
          method: existingAttendance?._id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionDate: isoDate, // Date complète ISO
            presentMembers,
            absentMembers
          }),
        }
      );
  
      if (!response.ok) throw new Error("Failed to save");
    
    toast.success(`Attendance ${existingAttendance?._id ? "updated" : "recorded"} successfully!`);

  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div>
      <LayoutTutor>
        <div className="container mt-4">
          <h2 className="mb-4">Group Attendance Management</h2>
          
          <div className="row">
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header bg-light text-dark">
                  <h5>Select Group</h5>
                </div>
                <div className="card-body">
                  <select
                    className="form-select"
                    onChange={(e) => handleGroupSelect(e.target.value)}
                    value={selectedGroup?._id || ""}
                  >
                    <option value="">-- Select a Group --</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedGroup && (
                <div className="card">
                  <div className="card-header bg-light text-dark">
                    <h5>Session Date</h5>
                  </div>
                  <div className="card-body">
                    <DatePicker
                      selected={sessionDate}
                      onChange={(date) => setSessionDate(date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-8">
              {selectedGroup ? (
                <>
                  <div className="card mb-4">
                    <div className="card-header bg-light text-dark">
                      <h5>
                        Mark Attendance for: <strong>{selectedGroup.name}</strong>
                      </h5>
                    </div>
                    <div className="card-body">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Member</th>
                           
                            <th>Status</th>
                            <th>Absence Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedGroup.members.map((member) => (
                            <tr key={member._id}>
                              <td>{member.name}</td>
                            
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    type="button"
                                    className={`btn ${
                                      member.attendanceStatus === "present"
                                        ? "btn-success"
                                        : "btn-outline-success"
                                    }`}
                                    onClick={() => handleAttendanceChange(member._id, true)}
                                  >
                                    Present
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn ${
                                      member.attendanceStatus === "absent"
                                        ? "btn-danger"
                                        : "btn-outline-danger"
                                    }`}
                                    onClick={() => handleAttendanceChange(member._id, false)}
                                  >
                                    Absent
                                  </button>
                                </div>
                              </td>
                              <td>
                                {member.attendanceStatus === "absent" && (
                                  <div className="absence-details">
                                    <div className="form-check">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`justified-${member._id}`}
                                        checked={absentDetails[member._id]?.isJustified || false}
                                        onChange={(e) => handleAbsenceDetailChange(
                                          member._id, 
                                          'isJustified', 
                                          e.target.checked
                                        )}
                                      />
                                      <label 
                                        className="form-check-label" 
                                        htmlFor={`justified-${member._id}`}
                                      >
                                        Justified
                                      </label>
                                    </div>

                                    {absentDetails[member._id]?.isJustified && (
                                      <div className="mb-2">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Reason"
                                          value={absentDetails[member._id]?.justification || ""}
                                          onChange={(e) => handleAbsenceDetailChange(
                                            member._id, 
                                            'justification', 
                                            e.target.value
                                          )}
                                        />
                                      </div>
                                    )}

<select
        className="form-select form-select-sm"
        value={absentDetails[member._id]?.followUpType || "Normal follow-up day"}
        onChange={(e) => handleAbsenceDetailChange(
          member._id, 
          'followUpType', 
          e.target.value
        )}
      >
        <option value="Normal follow-up day">Normal follow-up day</option>
        <option value="Validation day">Validation day</option>
      </select>
    </div>
  )}
</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <button
                        className="btn btn-primary float-end"
                        onClick={submitAttendance}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          "Save Attendance"
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="alert alert-info">
                  Please select a group to view and manage attendance.
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutTutor>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default GroupAttendance;