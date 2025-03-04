import React from 'react'

function DouaaComp() {
  return (
    <>
  <div className="container">
  <div className="row">
    {/* Left sidebar START */}
    <div className="col-xl-3">
      {/* Responsive offcanvas body START */}
      <div className="offcanvas-xl offcanvas-end" tabIndex={-1} id="offcanvasSidebar">
        {/* Offcanvas header */}
        <div className="offcanvas-header bg-light">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">My profile</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#offcanvasSidebar" aria-label="Close" />
        </div>
        {/* Offcanvas body */}
        <div className="offcanvas-body p-3 p-xl-0">
          <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
            {/* Dashboard menu */}
            <div className="list-group list-group-dark list-group-borderless">
              <a className="list-group-item" href="instructor-dashboard.html"><i className="bi bi-ui-checks-grid fa-fw me-2" />Dashboard</a>
              <a className="list-group-item" href="instructor-manage-course.html"><i className="bi bi-basket fa-fw me-2" />My Courses</a>
              <a className="list-group-item" href="instructor-quiz.html"><i className="bi bi-question-diamond fa-fw me-2" />Quiz</a>
              <a className="list-group-item" href="instructor-earning.html"><i className="bi bi-graph-up fa-fw me-2" />Earnings</a>
              <a className="list-group-item" href="instructor-studentlist.html"><i className="bi bi-people fa-fw me-2" />Students</a>
              <a className="list-group-item" href="instructor-order.html"><i className="bi bi-folder-check fa-fw me-2" />Orders</a>
              <a className="list-group-item" href="instructor-review.html"><i className="bi bi-star fa-fw me-2" />Reviews</a>
              <a className="list-group-item" href="instructor-edit-profile.html"><i className="bi bi-pencil-square fa-fw me-2" />Edit Profile</a>
              <a className="list-group-item" href="instructor-payout.html"><i className="bi bi-wallet2 fa-fw me-2" />Payouts</a>
              <a className="list-group-item active" href="instructor-setting.html"><i className="bi bi-gear fa-fw me-2" />Settings</a>
              <a className="list-group-item" href="instructor-delete-account.html"><i className="bi bi-trash fa-fw me-2" />Delete Profile</a>
              <a className="list-group-item text-danger bg-danger-soft-hover" href="sign-in.html"><i className="fas fa-sign-out-alt fa-fw me-2" />Sign out</a>
            </div>
          </div>
        </div>
      </div>
      {/* Responsive offcanvas body END */}
    </div>
    {/* Left sidebar END */}
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
                  <input className="form-check-input" type="checkbox" role="switch" id="profilePublic" defaultChecked />
                  <label className="form-check-label" htmlFor="profilePublic">Your profile's public visibility</label>
                </div>
                {/* Profile START */}
                <hr />{/* Divider */}
                {/* Notification START */}
                <h5 className="card-header-title">Notifications Settings</h5>
                <p className="mb-2 mt-3">Choose type of notifications you want to receive</p>
                <div className="form-check form-switch form-check-md mb-3">
                  <input className="form-check-input" type="checkbox" id="checkPrivacy1" defaultChecked />
                  <label className="form-check-label" htmlFor="checkPrivacy1">Notify me via email when logging in</label>
                </div>
                <div className="form-check form-switch form-check-md mb-3">
                  <input className="form-check-input" type="checkbox" id="checkPrivacy2" />
                  <label className="form-check-label" htmlFor="checkPrivacy2">Send SMS confirmation for all online payments</label>
                </div>
                <div className="form-check form-switch form-check-md mb-3">
                  <input className="form-check-input" type="checkbox" id="checkPrivacy3" defaultChecked />
                  <label className="form-check-label" htmlFor="checkPrivacy3">Check which device(s) access your account</label>
                </div>
                <div className="form-check form-switch form-check-md mb-3">
                  <input className="form-check-input" type="checkbox" id="checkPrivacy4" />
                  <label className="form-check-label" htmlFor="checkPrivacy4">Show your profile publicly</label>
                </div>
                {/* Notification START */}
                {/* Buttons */}
                <div className="d-sm-flex justify-content-end">
                  <button type="button" className="btn btn-sm btn-primary me-2 mb-0">Save changes</button>
                  <a href="#" className="btn btn-sm btn-outline-secondary mb-0">Cancel</a>
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
    </div>{/* Row END */}
  </div>
</div>

    
    
    </>
  )
}

export default DouaaComp