import react, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useState} from "react";
import LeftSideBar from "../components/LeftSideBar";


const UserSettings = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [role, setRole] = useState("student"); // Default role
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data from API
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/users");
                const data = await response.json();
                setUsername(data.username);
                setEmail(data.email);
                setPassword(data.password);
                setRole(data.role);
                } catch (error) {
                    console.error(error);
                }
            };

            fetchUserData();
        }, []);

    const handleNavigation = (path) => {
        navigate(path);
      };
return (
<>
  {/* Mirrored from eduport.webestica.com/instructor-setting.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 19 Feb 2025 10:26:39 GMT */}
  <title>Eduport - LMS, Education and Course Theme</title>
  {/* Meta Tags */}
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
  {/* Google Font */}
  <link rel="preconnect" href="https://fonts.googleapis.com/" />
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap"
  />
  {/* Plugins CSS */}
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
  {/* Theme CSS */}
  <link rel="stylesheet" type="text/css" href="assets/css/style.css" />
  {/* Header START */}
  <header className="navbar-light navbar-sticky">
    {/* Logo Nav START */}
    <nav className="navbar navbar-expand-xl">
      <div className="container">
        {/* Logo START */}
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
        {/* Main navbar START */}
        <div className="navbar-collapse w-100 collapse" id="navbarCollapse">
          {/* Nav Main menu START */}
          <ul className="navbar-nav navbar-nav-scroll mx-auto">
            {/* Nav item 1 Demos */}
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
                {/* Dropdown submenu */}
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
                {/* Dropdown submenu */}
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
                {/* Dropdown submenu */}
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
            {/* Nav item 3 Account */}
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
                {/* Dropdown submenu */}
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
                        onClick={() => {
                        switch (role) {
                            case "admin":
                            handleNavigation("/admin-dashboard");
                            break;
                            case "tutor":
                            handleNavigation("/tutor-dashboard");
                            break;
                            case "student":
                            handleNavigation("/student-dashboard");
                            break;
                            default:
                            handleNavigation("/");
                            break;
                        }
                        }}
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
                {/* Dropdown submenu */}
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
                    href="/edit-profile"
                  >
                    <i className="fas fa-fw fa-edit me-1" />
                    Edit Profile
                  </a>{" "}
                </li>
                <li>
                  {" "}
                  <a className="dropdown-item" href="/user-settings">
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
                {/* Dropdown Level */}
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">
                    Dropdown levels
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-start"
                    data-bs-popper="none"
                  >
                    {/* dropdown submenu open right */}
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
                    {/* dropdown submenu open left */}
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
            {/* Nav item 4 Component*/}
            <li className="nav-item">
              <a className="nav-link" href="docs/alerts.html">
                Components
              </a>
            </li>
            {/* Nav item 5 link*/}
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
          {/* Nav Main menu END */}
          {/* Nav Search START */}
          <div className="nav my-3 my-xl-0 px-4 flex-nowrap align-items-center">
            <div className="nav-item w-100">
              <form className="position-relative">
                <input
                  className="form-control pe-5 bg-transparent"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button
                  className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                  type="submit"
                >
                  <i className="fas fa-search fs-6 " />
                </button>
              </form>
            </div>
          </div>
          {/* Nav Search END */}
        </div>
        {/* Main navbar END */}
        {/* Profile START */}
        <div className="dropdown ms-1 ms-lg-0">
          <a
            className="avatar avatar-sm p-0"
            href="#"
            id="profileDropdown"
            role="button"
            data-bs-auto-close="outside"
            data-bs-display="static"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              className="avatar-img rounded-circle"
              src="assets/images/avatar/01.jpg"
              alt="avatar"
            />
          </a>
          <ul
            className="dropdown-menu dropdown-animation dropdown-menu-end shadow pt-3"
            aria-labelledby="profileDropdown"
          >
            {/* Profile info */}
            <li className="px-3 mb-3">
              <div className="d-flex align-items-center">
                {/* Avatar */}
                <div className="avatar me-3">
                  <img
                    className="avatar-img rounded-circle shadow"
                    src="assets/images/avatar/01.jpg"
                    alt="avatar"
                  />
                </div>
                <div>
                  <a className="h6" href="#">
                    Lori Ferguson
                  </a>
                  <p className="small m-0">example@gmail.com</p>
                </div>
              </div>
            </li>
            <li>
              {" "}
              <hr className="dropdown-divider" />
            </li>
            {/* Links */}
            <li>
              <a className="dropdown-item" href="#">
                <i className="bi bi-person fa-fw me-2" />
                Edit Profile
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                <i className="bi bi-gear fa-fw me-2" />
                Account Settings
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                <i className="bi bi-info-circle fa-fw me-2" />
                Help
              </a>
            </li>
            <li>
              <a className="dropdown-item bg-danger-soft-hover" href="#">
                <i className="bi bi-power fa-fw me-2" />
                Sign Out
              </a>
            </li>
            <li>
              {" "}
              <hr className="dropdown-divider" />
            </li>
            {/* Dark mode options START */}
            <li>
              <div className="bg-light dark-mode-switch theme-icon-active d-flex align-items-center p-1 rounded mt-2">
                <button
                  type="button"
                  className="btn btn-sm mb-0"
                  data-bs-theme-value="light"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-sun fa-fw mode-switch"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
                    <use href="#" />
                  </svg>{" "}
                  Light
                </button>
                <button
                  type="button"
                  className="btn btn-sm mb-0"
                  data-bs-theme-value="dark"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-moon-stars fa-fw mode-switch"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z" />
                    <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z" />
                    <use href="#" />
                  </svg>{" "}
                  Dark
                </button>
                <button
                  type="button"
                  className="btn btn-sm mb-0 active"
                  data-bs-theme-value="auto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-circle-half fa-fw mode-switch"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
                    <use href="#" />
                  </svg>{" "}
                  Auto
                </button>
              </div>
            </li>
            {/* Dark mode options END*/}
          </ul>
        </div>
        {/* Profile START */}
      </div>
    </nav>
    {/* Logo Nav END */}
  </header>
  {/* Header END */}
  {/* **************** MAIN CONTENT START **************** */}
  <main>
    {/* =======================
Page Banner START */}
    <section className="pt-0">
      {/* Main banner background image */}
      <div className="container-fluid px-0">
        <div
          className="bg-blue h-100px h-md-200px rounded-0"
          style={{
            background:
              "url(assets/images/pattern/04.png) no-repeat center center",
            backgroundSize: "cover"
          }}
        ></div>
      </div>
      <div className="container mt-n4">
        <div className="row">
          {/* Profile banner START */}
          <div className="col-12">
            <div className="card bg-transparent card-body p-0">
              <div className="row d-flex justify-content-between">
                {/* Avatar */}
                <div className="col-auto mt-4 mt-md-0">
                  <div className="avatar avatar-xxl mt-n3">
                    <img
                      className="avatar-img rounded-circle border border-white border-3 shadow"
                      src="assets/images/avatar/01.jpg"
                      alt=""
                    />
                  </div>
                </div>
                {/* Profile info */}
                <div className="col d-md-flex justify-content-between align-items-center mt-4">
                  <div>
                    <h1 className="my-1 fs-4">
                      Lori Stevens{" "}
                      <i className="bi bi-patch-check-fill text-info small" />
                    </h1>
                    <ul className="list-inline mb-0">
                      <li className="list-inline-item h6 fw-light me-3 mb-1 mb-sm-0">
                        <i className="fas fa-star text-warning me-2" />
                        4.5/5.0
                      </li>
                      <li className="list-inline-item h6 fw-light me-3 mb-1 mb-sm-0">
                        <i className="fas fa-user-graduate text-orange me-2" />
                        12k Enrolled Students
                      </li>
                      <li className="list-inline-item h6 fw-light me-3 mb-1 mb-sm-0">
                        <i className="fas fa-book text-purple me-2" />
                        25 Courses
                      </li>
                    </ul>
                  </div>
                  {/* Button */}
                  <div className="d-flex align-items-center mt-2 mt-md-0">
                    <a
                      href="instructor-create-course.html"
                      className="btn btn-success mb-0"
                    >
                      Create a course
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Profile banner END */}
            {/* Advanced filter responsive toggler START */}
            {/* Divider */}
            <hr className="d-xl-none" />
            <div className="col-12 col-xl-3 d-flex justify-content-between align-items-center">
              <a className="h6 mb-0 fw-bold d-xl-none" href="#">
                Menu
              </a>
              <button
                className="btn btn-primary d-xl-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasSidebar"
                aria-controls="offcanvasSidebar"
              >
                <i className="fas fa-sliders-h" />
              </button>
            </div>
            {/* Advanced filter responsive toggler END */}
          </div>
        </div>
      </div>
    </section>
    {/* =======================
Page Banner END */}
    {/* =======================
Page content START */}
    <section className="pt-0">
      <div className="container">
        <div className="row">
          {/* Left Side bar component */}
          <LeftSideBar />
          {/* Main content START */}
          <div className="col-xl-9">
            {/* Privacy START */}
            <div className="border rounded-3">
              <div className="row">
                <div className="col-12">
                  {/* Card START */}
                  <div className="card bg-transparent">
                    {/* Card header START */}
                    <div className="card-header bg-transparent border-bottom">
                      <h3 className="card-header-title">Settings</h3>
                    </div>
                    {/* Card header END */}
                    {/* Card body START */}
                    <div className="card-body">
                      {/* Profile START */}
                      <h5 className="mb-4">Profile Settings</h5>
                      <div className="form-check form-switch form-check-md">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="profilePublic"
                          defaultChecked=""
                        />
                        <label
                          className="form-check-label"
                          htmlFor="profilePublic"
                        >
                          Your profile's public visibility
                        </label>
                      </div>
                      {/* Profile START */}
                      <hr />
                      {/* Divider */}
                      {/* Notification START */}
                      <h5 className="card-header-title">
                        Notifications Settings
                      </h5>
                      <p className="mb-2 mt-3">
                        Choose type of notifications you want to receive
                      </p>
                      <div className="form-check form-switch form-check-md mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="checkPrivacy1"
                          defaultChecked=""
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkPrivacy1"
                        >
                          Notify me via email when logging in
                        </label>
                      </div>
                      <div className="form-check form-switch form-check-md mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="checkPrivacy2"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkPrivacy2"
                        >
                          Send SMS confirmation for all online payments
                        </label>
                      </div>
                      <div className="form-check form-switch form-check-md mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="checkPrivacy3"
                          defaultChecked=""
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkPrivacy3"
                        >
                          Check which device(s) access your account
                        </label>
                      </div>
                      <div className="form-check form-switch form-check-md mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="checkPrivacy4"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkPrivacy4"
                        >
                          Show your profile publicly
                        </label>
                      </div>
                      {/* Notification START */}
                      {/* Buttons */}
                      <div className="d-sm-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary me-2 mb-0"
                        >
                          Save changes
                        </button>
                        <a
                          href="#"
                          className="btn btn-sm btn-outline-secondary mb-0"
                        >
                          Cancel
                        </a>
                      </div>
                    </div>
                    {/* Card body END */}
                  </div>
                  {/* Card END */}
                </div>
                {/* Privacy END */}
              </div>
            </div>
            {/* Main content END */}
          </div>
          {/* Row END */}
        </div>
      </div>
    </section>
    {/* =======================
Page content END */}
  </main>
  {/* **************** MAIN CONTENT END **************** */}
  {/* =======================
Footer START */}
  <footer className="bg-dark p-3">
    <div className="container">
      <div className="row align-items-center">
        {/* Widget */}
        <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
          {/* Logo START */}
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
        {/* Widget */}
        <div className="col-md-4">
          {/* Rating */}
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
  {/* =======================
Footer END */}
  {/* Back to top */}
  <div className="back-top">
    <i className="bi bi-arrow-up-short position-absolute top-50 start-50 translate-middle" />
  </div>
  {/* Bootstrap JS */}
  {/* Template Functions */}
  {/* Mirrored from eduport.webestica.com/instructor-setting.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 19 Feb 2025 10:26:39 GMT */}
  <LeftSideBar role={role} handleNavigation={handleNavigation} />

</>

)
};
export default UserSettings;