import React from "react";
import Header from "./Header";


function Layout({ children }) {
  return (
    <div>
      {/* Header Section */}
      <Header />

      {/* Main Content Area */}
      <main className="auth-main">
        <div className="container">
          {children} {/* Content passed from child components like Login or Register */}
        </div>
      </main>

    </div>
  );
}

export default Layout;
