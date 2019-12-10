import React, { Component } from 'react';
import "./css/Navbar.css";
import SearchBar from './SearchBar.jsx';
import PropTypes from 'prop-types';


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

export default class Navbar extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="row navbar">
        <div className="col-md-2 col-sm-2 col-xs-2">
          <a className="" href="/">
            <img src='/logo.png' className="img-responsive scale-logo-navbar" alt="CU Reviews Logo" />
          </a>
        </div>
        <div className={"col-md-7 col-sm-7 col-xs-7"}>
          <SearchBar contrastingResultsBackground={true}/>
        </div>
        <div id="reportBugText">
          <a href="https://forms.gle/iDPXCywvm266yf457">Report a bug</a>
        </div>
      </div>
    )
  }

}
