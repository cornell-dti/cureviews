import React from "react";
import "./css/Navbar.css";
import SearchBar from "./SearchBar.jsx";
import { Session } from "../session-store";
import ProfileDropdownNavBar from "./ProfileDropdownNavBar.jsx";
import { useAuthOptionalLogin } from "../auth/auth_utils";
import { randomPicture } from "../util/profile_picture";
import { useLocation } from "react-router-dom";

/*
  Navbar Component. Short description if needed.

  Identify as one of the following components:
  Simple styling: mainly renders HTML and CSS,
  Container: combines multiple components into a single feature
  View: top-level component accessed by a URL endpoint defined by the router in main.jsx

  Include a breif description of the component's purpose, where it falls in the
  component tree, and any inportant information it accesses or modifies.
  Include the route for View components.
*/

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

const profilePicture = randomPicture();

type NavbarProps = {
  userInput: string;
};

export default function Navbar({ userInput }: NavbarProps) {

  const [isLoggedIn, token, signIn, signOut] = useAuthOptionalLogin();
  const location = useLocation();

  function displayButton() {
    const token = Session.get("token");
    if (token) {
      return (
        <ProfileDropdownNavBar
          imgSrc={`${String(profilePicture)}`}
          isLoggedIn={token}
          signOut={signOut}
        />
      );
    } else {
      return (
        <button
          type="button"
          className="btn btn-light sign-in-button"
          onClick={() => {
            signIn("path:" + location.pathname);
          }}
        >
          Sign In
        </button>
      );
    }
  }

  return (
    <div className="custom-navbar">
      <div className="logo-container">
        <a className="" href="/">
          <img
            src="/logo.svg"
            className="img-fluid scale-logo-navbar"
            alt="CU Reviews Logo"
          />
        </a>
      </div>
      <div className="col navbar-searchbar-container">
        <SearchBar
          userInput={userInput}
          contrastingResultsBackground={true}
          isInNavbar={true}
        />
      </div>
      {displayButton()}
    </div>
  );
}
