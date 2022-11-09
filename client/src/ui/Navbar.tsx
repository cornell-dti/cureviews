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

type NavbarProps = {
  userInput: string;
};

export default function Navbar({ userInput }: NavbarProps) {

  const [isLoggedIn, token, signIn, signOut] = useAuthOptionalLogin();
  const location = useLocation();

  const profilePicture = randomPicture(token ? token : "");

  function displayButton() {
    const token = Session.get("token");
    if (token) {
      return (
        <ProfileDropdownNavBar
          imgSrc={`${String(profilePicture)}`}
          isLoggedIn={token}
          signOut={() => {
            if (["/profile"].includes(location.pathname)) {
              signOut("/");
            }
            signOut();
          }}
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
