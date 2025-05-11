import React from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Home from "./pages/Home";
import RegisterPage from "./pages/auth/RegisterPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import LoggedInHome from "./pages/LoggedInHome";
import GithubCallback from "./pages/GithubCallback";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import SubjectForm from "./pages/dashboard/SubjectForm";
import SubjectList from "./pages/dashboard/SubjectList";
import CreateGroup from "./pages/dashboard/CreateGroup";


import SkillsManager from "./pages/dashboard/SkillsManager";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import TutorDashboard from "./pages/dashboard/TutorDashboard";
import SubjectAssignment from "./pages/dashboard/SubjectAssignment";
import UsersList from "./pages/UsersList";
import GroupList from "./pages/GroupList";
import SubjectAdmin from "./pages/SubjectAdmin";
import CreateSubjectAdmin from "./pages/CreateSubjectAdmin";
import ProjectAdmin from "./pages/ProjectAdmin";
import GroupTutor from "./pages/GroupTutor";
import InvitationList from "./pages/UserGroupInvitations";
import Logout from "./pages/auth/Logout";
import EditProfile from "./pages/auth/EditProfile";
import UserSettings from "./pages/auth/UserSettings";
import NoursDashboar from "./pages/test/NoursDashboar";
import DouaaComp from "./pages/test/DouaaComp";
import ReturnDeliverable from "./pages/evaluation/ReturnDeliverable";
import DeliverablesHistory from "./pages/evaluation/DeliverablesDashboard";
import TutorsDeliverables from "./pages/evaluation/TutorsDeliverables";
import { Toaster } from "sonner";
import MessagesList from "./pages/tutor-interfaces/messageslist/MessagesList";
import AdminTaskDashboard from "./pages/tasks/AdminTasks";
import TaskManager from "./pages/tasks/DashboardTasks";
 
import {Navigate} from "react-router-dom";
import ProjectManager from "./pages/ProjectManager";
import ProjectTutor from "./pages/ProjectTutor";
import TaskManagerTutor from "./pages/tasks/TaskManagerTutor";
import Dashboard from "./pages/tutor-interfaces/DashboardStat";
 import UsersTable from "./pages/tutor-interfaces/UsersTable";
import ProjectRecommendations from "./pages/ProjectRecommendations";
import TeamFormationSuggestions from "./pages/TeamFormationSuggestions";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/github-callback" element={<GithubCallback />} />
          <Route path="/loggedIn" element={<LoggedInHome />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/Skills-Manager" element={<SkillsManager />} />
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
          <Route path="/Subject-Assignment" element={<SubjectAssignment />} />
          <Route path="/Subject-Form" element={<SubjectForm />} />
          <Route path="/Subject-List" element={<SubjectList />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route path="/usersList" element={<UsersList />} />
          <Route path="/groupList" element={<GroupList />} />
          <Route path="/SubjectAdmin" element={<SubjectAdmin />} />
          <Route path="/CreateSubjectAdmin" element={<CreateSubjectAdmin />} />
          <Route path="/ProjectAdmin" element={<ProjectAdmin />} />
          <Route path="/GroupTutor" element={<GroupTutor />} />
          <Route path="/Project-Manager" element={<ProjectManager />} />
          <Route path="/Project-Tutor" element={<ProjectTutor />} />
          <Route path="/InvitationList" element={<InvitationList />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/user-settings" element={<UserSettings />} />
          <Route path="/messages" element={<MessagesList />} />
          <Route path="/tasks" element={< TaskManager />} />
          <Route path="/return-deliverable" element={<ReturnDeliverable />} />
          <Route path="/deliverables-history" element={<DeliverablesHistory />} />
          <Route path="/tutors-deliverables" element={<TutorsDeliverables />} />
          <Route path="/dashboard-tasks" element={< AdminTaskDashboard/>} />
          
          <Route path="/task-manager-tutor" element={<TaskManagerTutor />} />
          <Route path="/dashboard-stat" element={<Dashboard />} />
          <Route path="/users-table" element={<UsersTable />} />
          <Route path="/project-recommendations" element={<ProjectRecommendations />} />
          <Route path="/team-formation/:projectId" element={<TeamFormationSuggestions />} />
    
<Route path="/nour" element={<NoursDashboar/>} >
<Route path="douaa" element={<DouaaComp/>} />
</Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />

    </div>
  );
}

export default App;
