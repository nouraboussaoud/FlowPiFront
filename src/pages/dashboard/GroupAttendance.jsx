import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom"; // Import useLocation from react-router-dom
import LayoutTutor from "./LayoutTutorss";

const GroupAttendance = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [sessionDate, setSessionDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

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
        toast.error(error.message);  // Toast error if fetching fails
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  // Handle pre-filling of attendance when group and date are passed via location state
  useEffect(() => {
    if (location.state) {
      const { groupId, sessionDate } = location.state;

      const group = groups.find((g) => g._id === groupId);
      if (group) {
        setSelectedGroup(group);
        setSessionDate(new Date(sessionDate));

        // Fetch and pre-fill attendance data for the selected group and date
        fetchExistingAttendance(groupId, sessionDate);
      }
    }
  }, [location.state, groups]);

  // Fetch existing attendance for the group and date
  const fetchExistingAttendance = async (groupId, date) => {
    try {
      const token = localStorage.getItem("token");
      const formattedDate = new Date(date).toISOString().split("T")[0];

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
        setSelectedGroup((prev) => ({
          ...prev,
          members: prev.members.map((member) => ({
            ...member,
            attendanceStatus: data.presentMembers.some(
              (m) => m._id === member._id
            )
              ? "present"
              : "absent",
          })),
        }));
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
    setSelectedGroup((prev) => ({
      ...prev,
      members: prev.members.map((member) => {
        if (member._id === memberId) {
          return { ...member, attendanceStatus: isPresent ? "present" : "absent" };
        }
        return member;
      }),
    }));
  };

  // Submit the attendance data (either update or create new record)
  const submitAttendance = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      const formattedDate = sessionDate.toISOString().split("T")[0];
      const token = localStorage.getItem("token");

      const presentMembers = selectedGroup.members
        .filter((member) => member.attendanceStatus === "present")
        .map((member) => member._id);

      const absentMembers = selectedGroup.members
        .filter((member) => member.attendanceStatus === "absent")
        .map((member) => member._id);

      // Check if attendance already exists for this group and date
      const checkResponse = await fetch(
        `http://localhost:5000/api/attendance/group/${selectedGroup._id}/date/${formattedDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let existingAttendance = null;
      if (checkResponse.ok) {
        existingAttendance = await checkResponse.json();
      }

      if (existingAttendance && existingAttendance._id) {
        // Update the existing attendance record
        const updateResponse = await fetch(
          `http://localhost:5000/api/attendance/update/${existingAttendance._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sessionDate: sessionDate.toISOString(),
              presentMembers,
              absentMembers,
            }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update attendance");
        }

        toast.success("Attendance updated successfully!");
      } else {
        // Create a new attendance record
        const createResponse = await fetch(
          `http://localhost:5000/api/attendance/group/${selectedGroup._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sessionDate: sessionDate.toISOString(),
              presentMembers,
              absentMembers,
            }),
          }
        );

        if (!createResponse.ok) {
          throw new Error("Failed to save attendance");
        }

        toast.success("Attendance recorded successfully!");
      }

      // Re-fetch the updated attendance records
      const attendanceResponse = await fetch(
        `http://localhost:5000/api/attendance/group/${selectedGroup._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (attendanceResponse.ok) {
        const data = await attendanceResponse.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error saving attendance:", error);
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
                            <th>Email</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedGroup.members.map((member) => (
                            <tr key={member._id}>
                              <td>{member.name}</td>
                              <td>{member.email}</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    type="button"
                                    className={`btn ${
                                      member.attendanceStatus === "present"
                                        ? "btn-success"
                                        : "btn-outline-success"
                                    }`}
                                    onClick={() =>
                                      handleAttendanceChange(member._id, true)
                                    }
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
                                    onClick={() =>
                                      handleAttendanceChange(member._id, false)
                                    }
                                  >
                                    Absent
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <button
                        className="btn btn-secondary float-end"
                        onClick={submitAttendance}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Attendance"}
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

      {/* ToastContainer to show the toasts */}
      <ToastContainer />
    </div>
  );
};

export default GroupAttendance;
