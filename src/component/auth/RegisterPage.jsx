import React from "react";
import "/src/assets/dist/css/app.css";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container sm:px-10">
      <div className="block xl:grid grid-cols-2 gap-4">
        {/* Register Info */}
        <div className="hidden xl:flex flex-col min-h-screen">
          <a href="#" className="-intro-x flex items-center pt-5">
            <img alt="Midone - HTML Admin Template" className="w-6" src="src/assets/dist/images/logo.png" />
            <span className="text-white text-lg ml-3"> FlowPi </span>
          </a>
          <div className="my-auto">
            <img alt="Midone - HTML Admin Template" className="-intro-x w-1/2 -mt-16" src="/src/assets/dist/images/illustration.svg" />
            <div className="-intro-x text-white font-medium text-4xl leading-tight mt-10">
              A few more clicks to <br /> sign up to your account.
            </div>
            <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
              Manage all your e-commerce accounts in one place
            </div>
          </div>
        </div>
        {/* Register Form */}
        <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
          <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
            <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">Sign Up</h2>
            <div className="intro-x mt-2 text-slate-400 dark:text-slate-400 xl:hidden text-center">
              A few more clicks to sign in to your account. Manage all your e-commerce accounts in one place
            </div>
            <div className="intro-x mt-8">
              <input type="text" className="intro-x login__input form-control py-3 px-4 block" placeholder="First Name" />
              <input type="text" className="intro-x login__input form-control py-3 px-4 block mt-4" placeholder="Last Name" />
              <input type="text" className="intro-x login__input form-control py-3 px-4 block mt-4" placeholder="Email" />
              <input type="password" className="intro-x login__input form-control py-3 px-4 block mt-4" placeholder="Password" />
              <div className="intro-x w-full grid grid-cols-12 gap-4 h-1 mt-3">
                <div className="col-span-3 h-full rounded bg-success"></div>
                <div className="col-span-3 h-full rounded bg-success"></div>
                <div className="col-span-3 h-full rounded bg-success"></div>
                <div className="col-span-3 h-full rounded bg-slate-100 dark:bg-darkmode-800"></div>
              </div>
              <a href="#" className="intro-x text-slate-500 block mt-2 text-xs sm:text-sm">What is a secure password?</a>
              <input type="password" className="intro-x login__input form-control py-3 px-4 block mt-4" placeholder="Password Confirmation" />
            </div>
            <div className="intro-x flex items-center text-slate-600 dark:text-slate-500 mt-4 text-xs sm:text-sm">
              <input id="agree-terms" type="checkbox" className="form-check-input border mr-2" />
              <label className="cursor-pointer select-none" htmlFor="agree-terms">
                I agree to the Envato
              </label>
              <a className="text-primary dark:text-slate-200 ml-1" href="#">Privacy Policy</a>.
            </div>
            <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
              <button className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top">Register</button>
              <button className="btn btn-outline-secondary py-3 px-4 w-full xl:w-32 mt-3 xl:mt-0 align-top"
              onClick={() => navigate("/login")}
              >Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
