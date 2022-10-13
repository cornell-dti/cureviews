import React, { Component, useEffect, useState } from "react";
import "./css/Navbar.css";
import SearchBar from "./SearchBar.jsx";
import LoginModal from "./LoginModal";
import { Session } from "../session-store";
import ProfileDropdown from "./ProfileDropdown.jsx";

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

function signOut() {
  Session.set("token", null);
  const token = Session.get("token");
  const isLoggedIn = false;
}

function displayButton() {
  const token = Session.get("token");
  const isLoggedIn =
    token &&
    token !== "" &&
    new Date(JSON.parse(atob(token.split(".")[1])).exp * 1000) > new Date();
  if (isLoggedIn) {
    return <ProfileDropdown isLoggedIn={isLoggedIn} signOut={signOut} />;
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

export default class Navbar extends Component<{ readonly userInput: string }> {
  render() {
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
            userInput={this.props.userInput}
            contrastingResultsBackground={true}
            isInNavbar={true}
          />
        </div>
        <LoginModal />
        {displayButton()}
      </div>
    );
  }
}
