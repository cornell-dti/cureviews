import React, {useEffect, useState } from "react";
import SearchBar from "./SearchBar.jsx";
import LoginModal from "./LoginModal";
import ProfileDropdown from "./ProfileDropdown.jsx";
import "./css/App.css";
import { Session } from "../session-store";

/*
  App Component. Uppermost View component in the component tree,
  the first element of the HTML body tag grabbed by main.html.

  Renders the application homepage with a navbar and searchbar, popular
  classes and recent reviews components.
*/

export default function App(imgSrc: any): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Session.get("token");

    if (
      token &&
      token !== "" &&
      new Date(JSON.parse(atob(token.split(".")[1])).exp * 1000) > new Date()
    ) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [isLoggedIn]);

  const sunset_start_times = [
    17.0, 17.5, 18, 19.5, 20, 20.5, 20.5, 19.5, 18.5, 18, 16.5, 16.5,
  ];
  const sunset_end_times = [
    18.5, 19, 20.5, 21, 22, 22, 22, 21.5, 20.5, 20, 19, 18,
  ];
  const date = new Date();
  const month = date.getMonth();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  let time_of_day = hours;
  if (minutes > 30) {
    time_of_day += 0.51;
  }

  let monthclass = "";
  let dayclass = "afternoon";

  if (month < 2 || month > 10) {
    monthclass = "winter";
  } else if (month > 7) {
    monthclass = "fall";
  } else if (month > 4) {
    monthclass = "summer";
  } else {
    monthclass = "spring";
  }

  if (time_of_day < 6 || time_of_day >= sunset_end_times[month]) {
    dayclass = "night";
  } else if (time_of_day >= sunset_start_times[month]) {
    dayclass = "sunset";
  }

  function signOut() {
    Session.set("token", null);
    setIsLoggedIn(false);
  }

  function displayButton() {
    if (isLoggedIn) {
      return (
        <ProfileDropdown
          imgSrc={`${String(imgSrc.imgSrc)}`}
          isLoggedIn={isLoggedIn}
          signOut={signOut}
        />
      );
    } else {
      return (
        <button
          type="button"
          className="btn btn-light sign-in-button"
          data-toggle="modal"
          data-target="#signinModal"
        >
          Sign In
        </button>
      );
    }
  }
  return (
    <div className="row">
      <LoginModal />
      <div
        className={
          "col full-height background-common background-gradient_" +
          dayclass +
          monthclass
        }
      >
        {displayButton()}

        <div className="row">
          <img
            src="/logo.svg"
            className="img-fluid scale-logo-homepage"
            alt="CU Reviews Logo"
          />
        </div>
        <div className="row homepage-text-padding">
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12 col-12">
            <div className="row">
              <p className="homepage-text">
                Search for Cornell courses, rate past classes, and share
                feedback
              </p>
            </div>
            <SearchBar
              imgSrc={`${String(imgSrc.imgSrc)}`}
              signOut={signOut}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
        <div className="">
          <img src="/dti_logo.png" className="dti-logo" alt="DTI Logo" />
        </div>
      </div>
    </div>
  );
}
