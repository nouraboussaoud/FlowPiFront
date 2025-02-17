import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [profilePic, setProfilePic] = useState(null); // To store the selected file

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (profilePic) formData.append("profilePic", profilePic); // File upload

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData, // Send as FormData
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please check your email for verification.");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="container sm:px-10">
      <div className="block xl:grid grid-cols-2 gap-4">
        {/* Left Section (Illustration) */}
        <div className="hidden xl:flex flex-col min-h-screen">
          <a href="#" className="-intro-x flex items-center pt-5">
            <span className="text-white text-lg ml-3"> FlowPi </span>
          </a>
          <div className="my-auto">
            <img
              alt="Illustration"
              className="-intro-x w-1/2 -mt-16"
              src="assets/images/illustration.svg"
            />
            <div className="-intro-x text-white font-medium text-4xl leading-tight mt-10">
              A few more clicks to <br /> sign up to your account.
            </div>
          </div>
        </div>

        {/* Right Section (Form) */}
        <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
          <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
            <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">Sign Up</h2>
            <form onSubmit={handleRegister} className="intro-x mt-8">
              {/* Name Input */}
              <div className="mt-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="intro-x form-control py-3 px-4 block border border-gray-300"
                  placeholder="Full Name"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="mt-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="intro-x form-control py-3 px-4 block border border-gray-300"
                  placeholder="Email Address"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="mt-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="intro-x form-control py-3 px-4 block border border-gray-300"
                  placeholder="Password"
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="mt-4">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="intro-x form-control py-3 px-4 block border border-gray-300"
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>

              {/* Profile Picture Upload */}
              <div className="mt-4">
                <input
                  type="file"
                  onChange={(e) => setProfilePic(e.target.files[0])}
                  className="intro-x form-control py-3 px-4 block"
                />
              </div>

              {/* Submit Button */}
              <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                <button type="submit" className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3">
                  Register
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary py-3 px-4 w-full xl:w-32 mt-3 xl:mt-0"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
