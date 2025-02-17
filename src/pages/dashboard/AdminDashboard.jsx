import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";


const AdminDashboard = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    
    <><Header /><div className="admin-dashboard">
      <div className="container mx-auto">
        <h2 className="text-3xl font-semibold text-center my-5">Admin Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded-md p-5">
            <h3 className="font-bold text-xl">Users</h3>
            <p className="text-gray-600">Total Users: 1500</p>
            <button className="btn btn-primary mt-3"
              onClick={() => navigate("/usersList")} // Navigate to Users List
            >Manage Users</button>
          </div>
          <div className="bg-white shadow-md rounded-md p-5">
            <h3 className="font-bold text-xl">System Health</h3>
            <p className="text-gray-600">CPU Usage: 60%</p>
            <p className="text-gray-600">Memory Usage: 70%</p>
            <button className="btn btn-primary mt-3">View Logs</button>
          </div>
          <div className="bg-white shadow-md rounded-md p-5">
            <h3 className="font-bold text-xl">Revenue</h3>
            <p className="text-gray-600">Total Revenue: $10,000</p>
            <button className="btn btn-primary mt-3">View Reports</button>
          </div>
        </div>
      </div>
    </div></>
  );
};

export default AdminDashboard;
