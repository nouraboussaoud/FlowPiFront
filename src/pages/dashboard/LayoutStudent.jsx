import React from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';

const LayoutStudent = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleEditProfile = () => {
    navigate("/edit-profile"); 
  };
  const logoutUser = async () => {
    try {
      // Send the POST request to the backend
      const response = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,  // Send the JWT token
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();

      if (response.ok) {
        // If the server responds with success, remove token and role from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        // Redirect to the login page
        navigate("/login");
      } else {
        alert(data.message || "Logout failed!");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Something went wrong during logout!");
    }
  };

  return (
    <div>
       <>
  <title>Eduport - LMS, Education and Course Theme</title>
  <meta charSet="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no"
  />
  <meta name="author" content="Webestica.com" />
  <meta name="description" content="Eduport- LMS, Education and Course Theme" />
  {/* Dark mode */}
  {/* Favicon */}
  <link rel="shortcut icon" href="assets/images/favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com/" />
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap"
  />
  <link
    rel="stylesheet"
    type="text/css"
    href="assets/vendor/font-awesome/css/all.min.css"
  />
  <link
    rel="stylesheet"
    type="text/css"
    href="assets/vendor/bootstrap-icons/bootstrap-icons.css"
  />
  <link
    rel="stylesheet"
    type="text/css"
    href="assets/vendor/choices/css/choices.min.css"
  />
  <link rel="stylesheet" type="text/css" href="assets/vendor/aos/aos.css" />
  <link rel="stylesheet" type="text/css" href="assets/css/style.css" />
  <header className="navbar-light navbar-sticky">
    <nav className="navbar navbar-expand-xl">
      <div className="container">
        <a className="navbar-brand" href="index.html">
          <img
            className="light-mode-item navbar-brand-item"
            src="assets/images/logo.svg"
            alt="logo"
          />
          <img
            className="dark-mode-item navbar-brand-item"
            src="assets/images/logo-light.svg"
            alt="logo"
          />
        </a>
        {/* Logo END */}
        {/* Responsive navbar toggler */}
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-animation">
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className="navbar-collapse w-100 collapse" id="navbarCollapse">
          <ul className="navbar-nav navbar-nav-scroll mx-auto">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="demoMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Demos
              </a>
              <ul className="dropdown-menu" aria-labelledby="demoMenu">
                <li>
                  {" "}
                  <a className="dropdown-item" href="index.html">
                    Home Default
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-3.html">
                    Home Education
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-4.html">
                    Home Academy
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-5.html">
                    Home Course
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-6.html">
                    Home University
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-7.html">
                    Home Kindergarten
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-8.html">
                    Home Landing
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-9.html">
                    Home Tutor
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-10.html">
                    Home School
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-11.html">
                    Home Abroad
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="index-12.html">
                    Home Workshop
                  </a>
                </li>
              </ul>
            </li>
            {/* Nav item 2 Pages */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="pagesMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Pages
              </a>
              <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Course
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="course-categories.html"
                      >
                        Course Categories
                      </a>
                    </li>
                    <li>
                      {" "}
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="course-grid.html">
                        Course Grid Classic
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="course-grid-2.html">
                        Course Grid Minimal
                      </a>
                    </li>
                    <li>
                      {" "}
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="course-list.html">
                        Course List Classic
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="course-list-2.html">
                        Course List Minimal
                      </a>
                    </li>
                    <li>
                      {" "}
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="course-detail.html">
                        Course Detail Classic
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="course-detail-min.html"
                      >
                        Course Detail Minimal
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="course-detail-adv.html"
                      >
                        Course Detail Advance
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="course-detail-module.html"
                      >
                        Course Detail Module
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="course-video-player.html"
                      >
                        Course Full Screen Video
                      </a>
                    </li>
                  </ul>
                </li>
                {/* Dropdown submenu */}
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    About
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a className="dropdown-item" href="about.html">
                        About Us
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="contact-us.html">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="blog-grid.html">
                        Blog Grid
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="blog-masonry.html">
                        Blog Masonry
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="blog-detail.html">
                        Blog Detail
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="pricing.html">
                        Pricing
                      </a>
                    </li>
                  </ul>
                </li>
                {/* Dropdown submenu */}
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Hero Banner
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="docs/snippet-hero-12.html"
                      >
                        Hero Form
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="docs/snippet-hero-13.html"
                      >
                        Hero Vector
                      </a>
                    </li>
                    <li>
                      {" "}
                      <p className="dropdown-item mb-0">Coming soon....</p>
                    </li>
                  </ul>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="instructor-list.html">
                    Instructor List
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="instructor-single.html">
                    Instructor Single
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="become-instructor.html">
                    Become an Instructor
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="abroad-single.html">
                    Abroad Single
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="workshop-detail.html">
                    Workshop Detail
                  </a>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="event-detail.html">
                    Event Detail
                  </a>
                </li>
                {/* Dropdown submenu */}
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Shop
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a className="dropdown-item" href="shop.html">
                        Shop grid
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="shop-product-detail.html"
                      >
                        Product detail
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="cart.html">
                        Cart
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="checkout.html">
                        Checkout
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="empty-cart.html">
                        Empty Cart
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="wishlist.html">
                        Wishlist
                      </a>
                    </li>
                  </ul>
                </li>
                {/* Dropdown submenu */}
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Help
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a className="dropdown-item" href="help-center.html">
                        Help Center
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="help-center-detail.html"
                      >
                        Help Center Single
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="faq.html">
                        FAQs
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Authentication
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a className="dropdown-item" href="sign-in.html">
                        Sign In
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="sign-up.html">
                        Sign Up
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="forgot-password.html">
                        Forgot Password
                      </a>
                    </li>
                  </ul>
                </li>
                {/* Dropdown submenu */}
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Form
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a className="dropdown-item" href="request-demo.html">
                        Request a demo
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="book-class.html">
                        Book a Class
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="request-access.html">
                        Free Access
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="university-admission-form.html"
                      >
                        Admission Form
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Specialty
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a className="dropdown-item" href="error-404.html">
                        Error 404
                      </a>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="coming-soon.html">
                        Coming Soon
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="accounntMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Accounts
              </a>
              <ul className="dropdown-menu" aria-labelledby="accounntMenu">
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    <i className="fas fa-user-tie fa-fw me-1" />
                    Instructor
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-dashboard.html"
                      >
                        <i className="bi bi-grid-fill fa-fw me-1" />
                        Dashboard
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-manage-course.html"
                      >
                        <i className="bi bi-basket-fill fa-fw me-1" />
                        Courses
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-create-course.html"
                      >
                        <i className="bi bi-file-earmark-plus-fill fa-fw me-1" />
                        Create Course
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="course-added.html">
                        <i className="bi bi-file-check-fill fa-fw me-1" />
                        Course Added
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="instructor-quiz.html">
                        <i className="bi bi-question-diamond fa-fw me-1" />
                        Quiz
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-earning.html"
                      >
                        <i className="fas fa-chart-line fa-fw me-1" />
                        Earnings
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-studentlist.html"
                      >
                        <i className="fas fa-user-graduate fa-fw me-1" />
                        Students
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="instructor-order.html">
                        <i className="bi bi-cart-check-fill fa-fw me-1" />
                        Orders
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-review.html"
                      >
                        <i className="bi bi-star-fill fa-fw me-1" />
                        Reviews
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="instructor-payout.html"
                      >
                        <i className="fas fa-wallet fa-fw me-1" />
                        Payout
                      </a>{" "}
                    </li>
                  </ul>
                </li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    <i className="fas fa-user-graduate fa-fw me-1" />
                    Student
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-dashboard.html"
                      >
                        <i className="bi bi-grid-fill fa-fw me-1" />
                        Dashboard
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-subscription.html"
                      >
                        <i className="bi bi-card-checklist fa-fw me-1" />
                        My Subscriptions
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-course-list.html"
                      >
                        <i className="bi bi-basket-fill fa-fw me-1" />
                        Courses
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-course-resume.html"
                      >
                        <i className="far fa-fw fa-file-alt me-1" />
                        Course Resume
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="student-quiz.html">
                        <i className="bi bi-question-diamond fa-fw me-1" />
                        Quiz{" "}
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a
                        className="dropdown-item"
                        href="student-payment-info.html"
                      >
                        <i className="bi bi-credit-card-2-front-fill fa-fw me-1" />
                        Payment Info
                      </a>{" "}
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="student-bookmark.html">
                        <i className="fas bi-cart-check-fill fa-fw me-1" />
                        Wishlist
                      </a>{" "}
                    </li>
                  </ul>
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="admin-dashboard.html">
                    <i className="fas fa-user-cog fa-fw me-1" />
                    Admin
                  </a>{" "}
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  {" "}
                  <a
                    className="dropdown-item"
                    href=""
                  >
                    <button className=""onClick={handleEditProfile} >
                    Edit Profile
                    </button>
                  </a>{" "}
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="instructor-setting.html">
                    <i className="fas fa-fw fa-cog me-1" />
                    Settings
                  </a>{" "}
                </li>
                <li>
                  {" "}
                  <a
                    className="dropdown-item"
                    href="instructor-delete-account.html"
                  >
                    <i className="fas fa-fw fa-trash-alt me-1" />
                    Delete Profile
                  </a>{" "}
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Dropdown levels
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    <li className="dropdown-submenu dropend">
                      <a className="dropdown-item dropdown-toggle" href="#">
                        Dropdown (end)
                      </a>
                      <ul className="dropdown-menu" data-bs-popper="none">
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                      </ul>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="#">
                        Dropdown item
                      </a>{" "}
                    </li>
                    <li className="dropdown-submenu dropstart">
                      <a className="dropdown-item dropdown-toggle" href="#">
                        Dropdown (start)
                      </a>
                      <ul
                        className="dropdown-menu dropdown-menu-end"
                        data-bs-popper="none"
                      >
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                        <li>
                          {" "}
                          <a className="dropdown-item" href="#">
                            Dropdown item
                          </a>{" "}
                        </li>
                      </ul>
                    </li>
                    <li>
                      {" "}
                      <a className="dropdown-item" href="#">
                        Dropdown item
                      </a>{" "}
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="docs/alerts.html">
                Components
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link"
                href="#"
                id="advanceMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fas fa-ellipsis-h" />
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end min-w-auto"
                data-bs-popper="none"
              >
                <li>
                  <a
                    className="dropdown-item"
                    href="https://support.webestica.com/"
                    target="_blank"
                  >
                    <i className="text-warning fa-fw bi bi-life-preserver me-2" />
                    Support
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="docs/index.html"
                    target="_blank"
                  >
                    <i className="text-danger fa-fw bi bi-card-text me-2" />
                    Documentation
                  </a>
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="rtl/index.html"
                    target="_blank"
                  >
                    <i className="text-info fa-fw bi bi-toggle-off me-2" />
                    RTL demo
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="https://themes.getbootstrap.com/store/webestica/"
                    target="_blank"
                  >
                    <i className="text-success fa-fw bi bi-cloud-download-fill me-2" />
                    Buy Eduport!
                  </a>
                </li>
                <li>
                  {" "}
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="docs/alerts.html"
                    target="_blank"
                  >
                    <i className="text-orange fa-fw bi bi-puzzle-fill me-2" />
                    Components
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="docs/snippets.html">
                    <i className="text-purple fa-fw bi bi-stickies-fill me-2" />
                    Snippets
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <div className="nav my-3 my-xl-0 px-4 flex-nowrap align-items-center">
           <button onClick={logoutUser}>logout</button>
          </div>
        </div>
     
      </div>
    </nav>
  </header>
 <main>
    <section className="pt-0">
      <div className="container">
        <div className="row">
          <div className="col-xl-3">
            <div
              className="offcanvas-xl offcanvas-end"
              tabIndex={-1}
              id="offcanvasSidebar"
            >
              <div className="offcanvas-header bg-light">
                <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                  My profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="offcanvas"
                  data-bs-target="#offcanvasSidebar"
                  aria-label="Close"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </section>

  </main>
  <footer className="bg-dark p-3">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
          <a href="index.html">
            {" "}
            <img
              className="h-20px"
              src="assets/images/logo-light.svg"
              alt="logo"
            />{" "}
          </a>
        </div>
        {/* Widget */}
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="text-center text-white text-primary-hover">
            Copyrights ©2024 Eduport. Build by{" "}
            <a
              href="https://www.webestica.com/"
              target="_blank"
              className="text-white"
            >
              Webestica
            </a>
            .
          </div>
        </div>
        <div className="col-md-4">
          <ul className="list-inline mb-0 text-center text-md-end">
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-facebook" />
              </a>
            </li>
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-instagram" />
              </a>
            </li>
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-linkedin-in" />
              </a>
            </li>
            <li className="list-inline-item ms-2">
              <a href="#">
                <i className="text-white fab fa-twitter" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
  <div className="back-top">
    <i className="bi bi-arrow-up-short position-absolute top-50 start-50 translate-middle" />
  </div>
 </>
    </div>
  )
}

export default LayoutStudent