import React from "react";


const LeftSideBar = ({role, handleNavigation}) => {
    return(
        <>
        {/* Left sidebar START */}
        <div className="col-xl-3">
        {/* Responsive offcanvas body START */}
        <div
          className="offcanvas-xl offcanvas-end"
          tabIndex={-1}
          id="offcanvasSidebar"
        >
          {/* Offcanvas header */}
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
          {/* Offcanvas body */}
          <div className="offcanvas-body p-3 p-xl-0">
            <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
              {/* Dashboard menu */}
              <div className="list-group list-group-dark list-group-borderless">
              <a
                className="list-group-item"
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
                  <i className="bi bi-ui-checks-grid fa-fw me-2" />
                  Dashboard
                </a>
                <a
                  className="list-group-item"
                  href="instructor-manage-course.html"
                >
                  <i className="bi bi-basket fa-fw me-2" />
                  My Courses
                </a>
                <a className="list-group-item" href="instructor-quiz.html">
                  <i className="bi bi-question-diamond fa-fw me-2" />
                  Quiz
                </a>
                <a
                  className="list-group-item"
                  href="instructor-earning.html"
                >
                  <i className="bi bi-graph-up fa-fw me-2" />
                  Earnings
                </a>
                <a
                  className="list-group-item"
                  href="instructor-studentlist.html"
                >
                  <i className="bi bi-people fa-fw me-2" />
                  Students
                </a>
                <a className="list-group-item" href="instructor-order.html">
                  <i className="bi bi-folder-check fa-fw me-2" />
                  Orders
                </a>
                <a
                  className="list-group-item"
                  href="instructor-review.html"
                >
                  <i className="bi bi-star fa-fw me-2" />
                  Reviews
                </a>
                <a
                  className="list-group-item"
                  href="/edit-profile"
                >
                  <i className="bi bi-pencil-square fa-fw me-2" />
                  Edit Profile
                </a>
                <a
                  className="list-group-item"
                  href="instructor-payout.html"
                >
                  <i className="bi bi-wallet2 fa-fw me-2" />
                  Payouts
                </a>
                <a
                  className="list-group-item active"
                  href="/user-settings"
                >
                  <i className="bi bi-gear fa-fw me-2" />
                  Settings
                </a>
                <a
                  className="list-group-item"
                  href="instructor-delete-account.html"
                >
                  <i className="bi bi-trash fa-fw me-2" />
                  Delete Profile
                </a>
                <a
                  className="list-group-item text-danger bg-danger-soft-hover"
                  href="/logout"
                >
                  <i className="fas fa-sign-out-alt fa-fw me-2" />
                  Sign out
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Responsive offcanvas body END */}
      </div>
      {/* Left sidebar END */}
      </>
    );
}

export default LeftSideBar;