import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { Pie, Bar, Doughnut, PolarArea, Line, Radar, Bubble } from 'react-chartjs-2';
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    userRoles: { labels: [], data: [] },
    tasks: { labels: [], data: [] },
    projects: { labels: [], data: [] },
    groups: { labels: [], data: [] },
    skills: { labels: [], data: [] },
    subjects: { labels: [], data: [] }
  });
  const location = useLocation();
    const navigate = useNavigate();
    
   
      
       useEffect(() => {
         const queryParams = new URLSearchParams(location.search);
         const token = queryParams.get('token');
         
         if (token) {
           localStorage.setItem('token', token);
           console.log('Token stored in localStorage:', token);
           navigate('/admin-dashboard', { replace: true });
         }
       }, [location, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch users data for user roles chart
        const usersResponse = await axios.get('http://localhost:5000/api/users/getAll', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch tasks data
        const tasksResponse = await axios.get('http://localhost:5000/api/tasks/getAllTasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch projects data
        const projectsResponse = await axios.get('http://localhost:5000/api/projects/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch groups data
        const groupsResponse = await axios.get('http://localhost:5000/api/groups/getAllGroups', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch skills data
        const skillsResponse = await axios.get('http://localhost:5000/api/skills/getAllSkills', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })); // Fallback if endpoint doesn't exist
        
        // Fetch subjects data
        const subjectsResponse = await axios.get('http://localhost:5000/api/subjects/getAllSubjects', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })); // Fallback if endpoint doesn't exist

        // Process user roles data
        const users = usersResponse.data;
        const roleCount = {
          'admin': 0,
          'student': 0,
          'tutor': 0
        };
        
        users.forEach(user => {
          if (roleCount.hasOwnProperty(user.role)) {
            roleCount[user.role]++;
          }
        });

        // Process tasks data
        const tasks = tasksResponse.data;
        const taskStatusCount = {
          'pending': 0,
          'in-progress': 0,
          'completed': 0
        };
        
        tasks.forEach(task => {
          const status = task.status ? task.status.toLowerCase() : '';
          if (status === 'pending') {
            taskStatusCount['pending']++;
          } else if (status === 'in-progress' || status === 'inprogress' || status === 'in progress') {
            taskStatusCount['in-progress']++;
          } else if (status === 'completed' || status === 'done') {
            taskStatusCount['completed']++;
          } else {
            // Default to pending for any unrecognized status
            taskStatusCount['pending']++;
          }
        });

        // Process projects data
        const projects = projectsResponse.data;
        const projectCategories = {
          'No Tasks': 0,
          'In Progress': 0,
          'Multiple Tasks': 0
        };
        
        projects.forEach(project => {
          if (!project.tasks || project.tasks.length === 0) {
            projectCategories['No Tasks']++;
          } else if (project.tasks.length === 1) {
            projectCategories['In Progress']++;
          } else {
            projectCategories['Multiple Tasks']++;
          }
        });

        // Process groups data
        const groups = groupsResponse.data;
        // Group by size or another meaningful attribute
        // For simplicity, we'll just count the first 3 groups or create generic groups
        const groupLabels = groups.length > 3 
          ? groups.slice(0, 3).map(g => g.name || `Group ${g._id.substring(0, 5)}`)
          : ['Group A', 'Group B', 'Group C'];
        
        const groupCounts = groups.length > 3
          ? groups.slice(0, 3).map(g => g.members ? g.members.length : 1)
          : [
              Math.floor(groups.length * 0.5), 
              Math.floor(groups.length * 0.3), 
              Math.floor(groups.length * 0.2) || 1
            ];

        // Process skills data
        const skills = skillsResponse.data;
        // Count the most common skills across users
        const skillsCount = {};
        
        // If skills data is available and has the expected structure
        if (skills && skills.length > 0) {
          skills.forEach(skill => {
            if (skill.name) {
              skillsCount[skill.name] = (skillsCount[skill.name] || 0) + 1;
            }
          });
        } else {
          // If no skills data, check if users have skills property
          users.forEach(user => {
            if (user.skills && Array.isArray(user.skills)) {
              user.skills.forEach(skill => {
                skillsCount[skill] = (skillsCount[skill] || 0) + 1;
              });
            }
          });
        }
        
        // Get top 5 skills
        const topSkills = Object.entries(skillsCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        // Process subjects data
        const subjects = subjectsResponse.data;
        const subjectsData = {
          labels: [],
          data: []
        };
        
        if (subjects && subjects.length > 0) {
          // Group subjects by creation date (month)
          const subjectsByMonth = {};
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          subjects.forEach(subject => {
            if (subject.createdAt) {
              const date = new Date(subject.createdAt);
              const monthIndex = date.getMonth();
              const monthName = months[monthIndex];
              subjectsByMonth[monthName] = (subjectsByMonth[monthName] || 0) + 1;
            }
          });
          
          // Convert to arrays for chart
          const sortedMonths = Object.keys(subjectsByMonth).sort((a, b) => {
            return months.indexOf(a) - months.indexOf(b);
          });
          
          subjectsData.labels = sortedMonths;
          subjectsData.data = sortedMonths.map(month => subjectsByMonth[month]);
        } else {
          // Default data if no subjects
          subjectsData.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          subjectsData.data = [0, 0, 0, 0, 0, 0];
        }

        // Update dashboard data
        setDashboardData({
          userRoles: {
            labels: Object.keys(roleCount).map(role => role.charAt(0).toUpperCase() + role.slice(1)),
            data: Object.values(roleCount)
          },
          tasks: {
            labels: Object.keys(taskStatusCount).map(status => 
              status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')
            ),
            data: Object.values(taskStatusCount)
          },
          projects: {
            labels: Object.keys(projectCategories),
            data: Object.values(projectCategories)
          },
          groups: {
            labels: groupLabels,
            data: groupCounts
          },
          skills: {
            labels: topSkills.map(skill => skill[0]),
            data: topSkills.map(skill => skill[1])
          },
          subjects: subjectsData
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart data objects
  const userRolesData = {
    labels: dashboardData.userRoles.labels,
    datasets: [
      {
        data: dashboardData.userRoles.data,
        backgroundColor: [
          '#10b981', // Green for Admin
          '#8b5cf6', // Purple for Student
          '#f59e0b'  // Amber for Tutor
        ],
        hoverBackgroundColor: [
          '#059669', // Darker green for hover
          '#7c3aed', // Darker purple for hover
          '#d97706'  // Darker amber for hover
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const tasksData = {
    labels: dashboardData.tasks.labels,
    datasets: [
      {
        data: dashboardData.tasks.data,
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        hoverBackgroundColor: ['#dc2626', '#d97706', '#059669'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const projectsData = {
    labels: dashboardData.projects.labels,
    datasets: [
      {
        data: dashboardData.projects.data,
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        hoverBackgroundColor: ['#2563eb', '#059669', '#d97706'],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const groupsData = {
    labels: dashboardData.groups.labels,
    datasets: [
      {
        data: dashboardData.groups.data,
        backgroundColor: ['#60a5fa', '#3b82f6', '#2563eb'],
        hoverBackgroundColor: ['#93c5fd', '#2563eb', '#1d4ed8'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const skillsData = {
    labels: dashboardData.skills.labels,
    datasets: [
      {
        label: 'Number of Users',
        data: dashboardData.skills.data,
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const subjectsData = {
    labels: dashboardData.subjects.labels,
    datasets: [
      {
        type: 'bar',
        label: 'New Subjects',
        data: dashboardData.subjects.data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      }
    ]
  };

  const taskCompletionTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tasks Created',
        data: [12, 19, 15, 27, 22, 31],
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Tasks Completed',
        data: [8, 12, 18, 14, 21, 25],
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const userActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [65, 59, 80, 81, 56, 40, 30],
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 12,
      }
    ]
  };

  const projectCompletionData = {
    labels: ['Project Planning', 'Requirements', 'Design', 'Development', 'Testing', 'Deployment'],
    datasets: [
      {
        label: 'Average Completion',
        data: [90, 75, 60, 45, 30, 20],
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgba(139, 92, 246, 1)',
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
        pointRadius: 4,
      }
    ]
  };

  // Chart options
  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-color)',
          font: {
            size: 14,
            family: 'Arial, sans-serif',
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'var(--content-bg)',
        titleColor: 'var(--text-color)',
        bodyColor: 'var(--text-color)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const barOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'var(--content-bg)',
        titleColor: 'var(--text-color)',
        bodyColor: 'var(--text-color)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'var(--text-color)',
        },
        grid: {
          color: 'var(--border-color)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: 'var(--text-color)',
        },
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const polarAreaOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-color)',
          font: {
            size: 14,
            family: 'Arial, sans-serif',
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'var(--content-bg)',
        titleColor: 'var(--text-color)',
        bodyColor: 'var(--text-color)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      r: {
        ticks: {
          display: false,
        },
        grid: {
          color: 'var(--border-color)',
        },
        angleLines: {
          color: 'var(--border-color)',
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const lineOptions = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-color)',
          font: {
            size: 14,
            family: 'Arial, sans-serif',
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'var(--content-bg)',
        titleColor: 'var(--text-color)',
        bodyColor: 'var(--text-color)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'var(--text-color)',
          precision: 0,
        },
        grid: {
          color: 'var(--border-color)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: 'var(--text-color)',
        },
        grid: {
          color: 'var(--border-color)',
          drawBorder: false,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="dashboard-content">
        <h2 className="section-title">Overview</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : (
          <div className="charts-grid">
            {/* User Roles Chart - Pie */}
            <div className="chart-card">
              <h3>User Roles</h3>
              <div className="chart-container">
                <Pie data={userRolesData} options={pieOptions} />
              </div>
            </div>

            {/* Tasks Chart - Doughnut */}
            <div className="chart-card">
              <h3>Tasks Status</h3>
              <div className="chart-container">
                <Doughnut data={tasksData} options={pieOptions} />
              </div>
            </div>

            {/* Projects Chart - Bar */}
            <div className="chart-card">
              <h3>Projects Status</h3>
              <div className="chart-container">
                <Bar data={projectsData} options={barOptions} />
              </div>
            </div>

            {/* Groups Chart - PolarArea */}
            <div className="chart-card">
              <h3>Groups Distribution</h3>
              <div className="chart-container">
                <PolarArea data={groupsData} options={polarAreaOptions} />
              </div>
            </div>
            
            {/* Skills Chart - Horizontal Bar */}
            <div className="chart-card">
              <h3>Top Skills</h3>
              <div className="chart-container">
                <Bar 
                  data={skillsData} 
                  options={{
                    ...barOptions,
                    indexAxis: 'y',
                    plugins: {
                      ...barOptions.plugins,
                      title: {
                        display: true,
                        text: 'Most Popular Skills',
                        color: 'var(--text-color)',
                        font: {
                          size: 16,
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Subjects Chart - Stacked Bar */}
            <div className="chart-card">
              <h3>Subjects by Month</h3>
              <div className="chart-container">
                <Bar 
                  data={subjectsData} 
                  options={{
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          color: 'var(--text-color)',
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'var(--content-bg)',
                        titleColor: 'var(--text-color)',
                        bodyColor: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            return `Subjects: ${context.parsed.y}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(156, 163, 175, 0.1)',
                          drawBorder: false,
                        },
                        ticks: {
                          color: 'var(--text-color)',
                          font: {
                            weight: 'bold',
                          },
                          precision: 0,
                          stepSize: 1
                        },
                        title: {
                          display: true,
                          text: 'Number of Subjects',
                          color: 'var(--text-color)',
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: 'var(--text-color)',
                          font: {
                            weight: 'bold',
                          }
                        },
                        title: {
                          display: true,
                          text: 'Month',
                          color: 'var(--text-color)',
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        }
                      }
                    },
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: {
                      duration: 1000,
                      easing: 'easeOutQuart'
                    }
                  }} 
                />
              </div>
            </div>

            {/* Task Completion Trend - Line Chart */}
            <div className="chart-card">
              <h3>Task Completion Trend</h3>
              <div className="chart-container">
                <Line data={taskCompletionTrendData} options={lineOptions} />
              </div>
            </div>

            {/* User Activity - Bar Chart */}
            <div className="chart-card">
              <h3>Weekly User Activity</h3>
              <div className="chart-container">
                <Bar data={userActivityData} options={barOptions} />
              </div>
            </div>

            {/* Project Completion Stages - Radar Chart */}
            <div className="chart-card">
              <h3>Project Completion Stages</h3>
              <div className="chart-container">
                <Radar 
                  data={projectCompletionData} 
                  options={{
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 20,
                          backdropColor: 'transparent'
                        },
                        pointLabels: {
                          font: {
                            size: 11
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    },
                    maintainAspectRatio: false,
                    responsive: true
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-content {
          padding: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1.5rem;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--primary-color);
          border-radius: 2px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .chart-card {
          background-color: var(--content-bg);
          border-radius: 12px;
          box-shadow: 0 4px 6px var(--shadow-color);
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .chart-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px var(--shadow-color);
        }

        .chart-card h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1rem;
          text-align: center;
        }

        .chart-container {
          height: 250px;
          position: relative;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          padding: 2rem;
          text-align: center;
        }

        .error-message {
          color: var(--danger);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .retry-button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .retry-button:hover {
          background-color: var(--primary-dark);
        }

        @media (max-width: 767.98px) {
          .dashboard-content {
            padding: 1rem;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .chart-container {
            height: 200px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminDashboard;
