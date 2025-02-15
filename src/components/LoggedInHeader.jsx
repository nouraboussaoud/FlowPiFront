import React, { useState, useEffect } from "react";
import Dropdown from 'react-bootstrap/Dropdown'; // Import React Bootstrap Dropdown

function LoggedIn() {
  const currentTheme = localStorage.getItem('theme');
  const [checked, setChecked] = useState(currentTheme === 'dark');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  function changeTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setChecked(true);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setChecked(false);
    }
  }

  function logout() {
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page
  }

  return (
    <div>
      {/*header*/}
      <header id="site-header" className="fixed-top">
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-dark stroke">
            <h1>
              <a className="navbar-brand" href="/">
                <span className="fa fa-diamond"></span>
                Study Course
                <span className="logo">Journey to success</span>
              </a>
            </h1>

            <button
              className="navbar-toggler collapsed bg-gradient"
              type="button"
              data-toggle="collapse"
              data-target="#navbarTogglerDemo02"
              aria-controls="navbarTogglerDemo02"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon fa icon-expand fa-bars"></span>
              <span className="navbar-toggler-icon fa icon-close fa-times"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
              <ul className="navbar-nav mx-lg-auto">
                <li className="nav-item active">
                  <a className="nav-link" href="/">
                    Home
                    <span className="sr-only">(current)</span>
                  </a>
                </li>
                <li className="nav-item @@about__active">
                  <a className="nav-link" href="/about">
                    About
                  </a>
                </li>
                <li className="nav-item @@courses__active">
                  <a className="nav-link" href="/courses">
                    Courses
                  </a>
                </li>
                <li className="nav-item @@contact__active">
                  <a className="nav-link" href="/contact">
                    Contact
                  </a>
                </li>
              </ul>

              {/*/search-right*/}
              <div className="search-right">
                <a href="#search" title="search">
                  <span className="fa fa-search" aria-hidden="true"></span>
                </a>
                {/* search popup */}
                <div id="search" className="pop-overlay">
                  <div className="popup">
                    <form
                      action="error.html"
                      method="GET"
                      className="search-box"
                    >
                      <input
                        type="search"
                        placeholder="Search"
                        name="search"
                        required="required"
                        autoFocus=""
                      />
                      <button type="submit" className="btn">
                        <span
                          className="fa fa-search"
                          aria-hidden="true"
                        ></span>
                      </button>
                    </form>
                  </div>
                  <a className="close" href="#close">
                    &times;
                  </a>
                </div>
                {/* /search popup */}
              </div>

              {/* User Components (Always Visible) */}
              <div className="top-quote mr-lg-2 text-center">
                <div className="d-flex align-items-center">
                  {/* Notifications Dropdown */}
                  <Dropdown className="mr-2">
                    <Dropdown.Toggle variant="outline-primary" id="notificationsDropdown">
                      <span className="fa fa-bell"></span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href="#">No new notifications</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* User Profile and Settings Dropdown */}
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="profileDropdown">
                      <img
                        src="/assets/images/github-mark.png"
                        alt="Profile"
                        className="rounded-circle mr-2"
                        style={{ width: "40px", height: "40px" }}
                      />
                      <span>{user ? user.name : "Guest"}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href="/account-settings">Account Settings</Dropdown.Item>
                      <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </div>

            {/* toggle switch for light and dark theme */}
            <div className="mobile-position">
              <nav className="navigation">
                <div className="theme-switch-wrapper">
                  <label className="theme-switch" htmlFor="checkbox">
                    <input type="checkbox" id="checkbox" checked={checked} onChange={changeTheme} />
                    <div className="mode-container py-1">
                      <i className="gg-sun"></i>
                      <i className="gg-moon"></i>
                    </div>
                  </label>
                </div>
              </nav>
            </div>
            {/* //toggle switch for light and dark theme */}
          </nav>
        </div>
      </header>
      {/*/header*/}
    </div>
  );
}

export default LoggedIn;