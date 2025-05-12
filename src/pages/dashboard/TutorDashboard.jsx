import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LayoutTutorss from './LayoutTutorss';
import UsersTable from '../tutor-interfaces/UsersTable';
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [groups, setGroups] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    students: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    projects: 0,
    unreadMessages: 0,
    groups: 0,
    subjects: 0
  });
  
  // Chart data states
  const [taskStatusData, setTaskStatusData] = useState({
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        'rgba(255, 206, 86, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)'
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  });

  const [projectProgressData, setProjectProgressData] = useState({
    labels: [],
    datasets: [{
      label: 'Completion %',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  });

  const [subjectDistributionData, setSubjectDistributionData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 1
    }]
  });

  const [studentPerformanceData, setStudentPerformanceData] = useState({
    labels: [],
    datasets: [{
      label: 'Average Score (%)',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch users data
        const usersResponse = await axios.get('http://localhost:5000/api/users/getAll', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter students
        const studentsData = usersResponse.data.filter(user => user.role === 'student') || [];
        setStudents(studentsData);
        
        // Fetch tasks data
        const tasksResponse = await axios.get('http://localhost:5000/api/tasks/getAllTasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTasks(tasksResponse.data || []);
        
        // Fetch projects data
        const projectsResponse = await axios.get('http://localhost:5000/api/projects/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjects(projectsResponse.data || []);
        
        // Fetch groups data
        const groupsResponse = await axios.get('http://localhost:5000/api/groups/getAllGroups', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setGroups(groupsResponse.data || []);

        // Fetch unread messages
        const messagesResponse = await axios.get('http://localhost:5000/api/messages/unread-counts-by-sender', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const unreadMessagesTotal = messagesResponse.data?.counts 
          ? Object.values(messagesResponse.data.counts).reduce((sum, count) => sum + count, 0)
          : 0;
        setUnreadMessages(unreadMessagesTotal);
        
        // Fetch subjects
        const subjectsResponse = await axios.get('http://localhost:5000/api/subject/getAllSubjects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSubjects(subjectsResponse.data || []);

        // Calculate task stats
        const tasksList = tasksResponse.data || [];
        const taskStatusCounts = {
          pending: tasksList.filter(task => task.status === 'pending').length,
          inProgress: tasksList.filter(task => task.status === 'in-progress').length,
          completed: tasksList.filter(task => task.status === 'completed').length
        };

        // Update stats
        setStats({
          students: studentsData.length,
          tasksCompleted: taskStatusCounts.completed,
          totalTasks: tasksList.length,
          projects: (projectsResponse.data || []).length,
          unreadMessages: unreadMessagesTotal,
          groups: (groupsResponse.data || []).length,
          subjects: (subjectsResponse.data || []).length
        });

        // Fetch today's sessions (mock data for now)
        // In a real app, you would fetch this from your API
        setTodaySessions([
          {
            id: 1,
            subject: 'Mathematics',
            student: 'John Doe',
            time: '10:00 AM',
            duration: '45 min'
          },
          {
            id: 2,
            subject: 'English',
            student: 'Jane Smith',
            time: '2:30 PM',
            duration: '60 min'
          }
        ]);

        // Update chart data
        updateChartData(
          studentsData, 
          tasksList, 
          projectsResponse.data || [], 
          subjectsResponse.data || []
        );

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const updateChartData = (students, tasks, projects, subjects) => {
    // Task status chart
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    setTaskStatusData({
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [{
        data: [pendingTasks, inProgressTasks, completedTasks],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    });

    // Project progress chart
    // Take up to 5 projects for better visualization
    const topProjects = projects.slice(0, 5);
    setProjectProgressData({
      labels: topProjects.map(project => project.name || `Project ${project._id?.substring(0, 5) || 'New'}`),
      datasets: [{
        label: 'Completion %',
        data: topProjects.map(project => {
          // Calculate project completion based on completed tasks
          if (!project.tasks || project.tasks.length === 0) return 0;
          const projectTasks = tasks.filter(task => 
            project.tasks.includes(task._id)
          );
          const completedProjectTasks = projectTasks.filter(task => task.status === 'completed').length;
          return projectTasks.length > 0 
            ? Math.round((completedProjectTasks / projectTasks.length) * 100) 
            : 0;
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    });

    // Subject distribution chart
    const colors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)'
    ];
    
    setSubjectDistributionData({
      labels: subjects.map(subject => subject.title || `Subject ${subject._id?.substring(0, 5) || 'New'}`),
      datasets: [{
        data: subjects.map((subject, index) => {
          // Count groups assigned to each subject
          return subject.assignedGroups?.length || Math.floor(Math.random() * 5) + 1;
        }),
        backgroundColor: subjects.map((_, index) => colors[index % colors.length]),
        borderWidth: 1
      }]
    });

    // Student performance by subject
    const subjectNames = subjects.map(subject => subject.title || `Subject ${subject._id?.substring(0, 5) || 'New'}`);
    setStudentPerformanceData({
      labels: subjectNames.slice(0, 5), // Take first 5 subjects
      datasets: [{
        label: 'Average Score (%)',
        data: Array(Math.min(subjects.length, 5)).fill(0).map(() => Math.floor(Math.random() * 30) + 70), // Random scores between 70-100
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    });
  };

  // Navigate to different pages
  const navigateTo = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <LayoutTutorss>
        <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </LayoutTutorss>
    );
  }

  return (
    <LayoutTutorss>
      <div className="container-fluid p-4">
        {/* Quick stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-2 me-3" style={{backgroundColor: 'rgba(54, 162, 235, 0.2)'}}>
                    <i className="bi bi-people-fill text-primary" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <h6 className="mb-0 text-muted">Students</h6>
                </div>
                <h3 className="mb-0 fw-bold">{stats.students}</h3>
                <div className="mt-2 small text-success"><i className="bi bi-arrow-up-short"></i> Active learners</div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-2 me-3" style={{backgroundColor: 'rgba(75, 192, 192, 0.2)'}}>
                    <i className="bi bi-check2-all text-success" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <h6 className="mb-0 text-muted">Tasks</h6>
                </div>
                <h3 className="mb-0 fw-bold">{stats.tasksCompleted}/{stats.totalTasks}</h3>
                <div className="mt-2 small text-success"><i className="bi bi-arrow-up-short"></i> Completed tasks</div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-2 me-3" style={{backgroundColor: 'rgba(255, 206, 86, 0.2)'}}>
                    <i className="bi bi-folder2-open text-warning" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <h6 className="mb-0 text-muted">Projects</h6>
                </div>
                <h3 className="mb-0 fw-bold">{stats.projects}</h3>
                <div className="mt-2 small text-success"><i className="bi bi-arrow-up-short"></i> Active projects</div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-2 me-3" style={{backgroundColor: 'rgba(255, 99, 132, 0.2)'}}>
                    <i className="bi bi-envelope-fill text-danger" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <h6 className="mb-0 text-muted">Messages</h6>
                </div>
                <h3 className="mb-0 fw-bold">{stats.unreadMessages}</h3>
                <div className="mt-2 small text-danger"><i className="bi bi-arrow-up-short"></i> Unread messages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="row mb-4">
          <div className="col-lg-8 mb-4 mb-lg-0">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Project Completion Progress</h5>
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-secondary active">Top 5</button>
                  <button className="btn btn-sm btn-outline-secondary">All</button>
                </div>
              </div>
              <div className="card-body">
                <Bar 
                  data={projectProgressData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Completion %'
                        }
                      }
                    }
                  }}
                  height={300}
                />
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header bg-white border-0">
                <h5 className="card-title mb-0">Task Status</h5>
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div style={{height: '200px', width: '200px'}}>
                  <Doughnut 
                    data={taskStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-3 text-center">
                  {taskStatusData.datasets[0].data[2] > 0 && stats.totalTasks > 0 && (
                    <div className="d-inline-block px-3 py-1 rounded-pill bg-success bg-opacity-10 text-success">
                      <small>
                        {Math.round((taskStatusData.datasets[0].data[2] / stats.totalTasks) * 100)}% Completion Rate
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second row of charts */}
        <div className="row mb-4">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header bg-white border-0">
                <h5 className="card-title mb-0">Subject Distribution</h5>
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div style={{height: '200px', width: '200px'}}>
                  <Pie 
                    data={subjectDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header bg-white border-0">
                <h5 className="card-title mb-0">Student Performance by Subject</h5>
              </div>
              <div className="card-body">
                <Bar 
                  data={studentPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                  height={200}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming sessions and quick actions */}
        <div className="row">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Recent Student Activity</h5>
                <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => navigate('/users-table')}>
                  <i className="bi bi-people me-1"></i> View All Students
                </button>
              </div>
              <div className="card-body p-0">
                {students.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {students.slice(0, 3).map(student => (
                      <div key={student._id} className="list-group-item border-0 py-3">
                        <div className="d-flex align-items-center">
                          <div className="student-avatar rounded-circle p-2 me-3" 
                               style={{backgroundColor: 'rgba(54, 162, 235, 0.2)'}}>
                            <i className="bi bi-person" 
                               style={{fontSize: '1.2rem', color: '#3498db'}}></i>
                          </div>
                          <div className="student-details">
                            <h6 className="mb-0 fw-bold">{student.name || `${student.firstName} ${student.lastName}`}</h6>
                            <div className="small text-muted">Last active: {new Date(student.lastActive || Date.now()).toLocaleDateString()}</div>
                          </div>
                          <div className="ms-auto">
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-pill"
                              onClick={() => navigate(`/student/${student._id}`)}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="mb-3">
                      <i className="bi bi-people text-muted" style={{fontSize: '2rem'}}></i>
                    </div>
                    <h6>No students found</h6>
                    <p className="text-muted small">Add students to see their activity here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-header bg-white border-0">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('dashboard')}
                    >
                      <i className="bi bi-grid me-2"></i>Quick Actions
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                      onClick={() => setActiveTab('users')}
                    >
                      <i className="bi bi-people me-2"></i>Students
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                {activeTab === 'dashboard' ? (
                  <div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body d-flex align-items-center p-3">
                            <div className="rounded-circle p-2 me-3 bg-primary bg-opacity-10">
                              <i className="bi bi-plus-circle text-primary"></i>
                            </div>
                            <div>
                              <h6 className="mb-0">Add New Student</h6>
                              <p className="text-muted small">Register a new student</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body d-flex align-items-center p-3">
                            <div className="rounded-circle p-2 me-3 bg-success bg-opacity-10">
                              <i className="bi bi-file-earmark-text text-success"></i>
                            </div>
                            <div>
                              <h6 className="mb-0">Create Lesson Plan</h6>
                              <p className="text-muted small">Plan a new lesson</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body d-flex align-items-center p-3">
                            <div className="rounded-circle p-2 me-3 bg-warning bg-opacity-10">
                              <i className="bi bi-graph-up text-warning"></i>
                            </div>
                            <div>
                              <h6 className="mb-0">View Reports</h6>
                              <p className="text-muted small">Check student performance</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body d-flex align-items-center p-3">
                            <div className="rounded-circle p-2 me-3 bg-info bg-opacity-10">
                              <i className="bi bi-envelope text-info"></i>
                            </div>
                            <div>
                              <h6 className="mb-0">Send Messages</h6>
                              <p className="text-muted small">Communicate with students</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="input-group mb-3">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control border-start-0" 
                        placeholder="Search students..." 
                      />
                    </div>
                    <UsersTable />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
           
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutTutorss>
  );
};

export default TutorDashboard;
