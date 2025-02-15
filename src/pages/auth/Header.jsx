import React, { useState } from "react";

function Header() {
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme) {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }

  const [checked, setChecked] = useState(currentTheme === "dark");

  function changeTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setChecked(true);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      setChecked(false);
    }
  }

  return (
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
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/about">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Theme Switch */}
          <div className="mobile-position">
            <nav className="navigation">
              <div className="theme-switch-wrapper">
                <label className="theme-switch" htmlFor="checkbox">
                  <input
                    type="checkbox"
                    id="checkbox"
                    checked={checked}
                    onChange={changeTheme}
                  />
                  <div className="mode-container py-1">
                    <i className="gg-sun"></i>
                    <i className="gg-moon"></i>
                  </div>
                </label>
              </div>
            </nav>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
