import React, { Component } from 'react';
import SearchBar from './SearchBar.jsx';
import "./css/App.css";



/*
  App Component. Uppermost View component in the component tree,
  the first element of the HTML body tag grabbed by main.html.

  Renders the application homepage with a navbar and searchbar, popular
  classes and recent reviews components.
*/
export default class App extends Component {
  render() {
    const date = new Date();
    const month = date.getMonth();
    const hours = date.getHours();
    let monthclass = "";
    let dayclass = "afternoon";

    if (month < 2 || month > 10) {
      monthclass = "winter"
    }

    else if (month > 6) {
      monthclass = "fall"
    }

    if (hours < 5 || hours > 19) {
      dayclass = "night"
      monthclass = "";
    }

    else if (hours > 17) {
      dayclass = "sunset"
    }
    return (
      <div className={"container-fluid full-height background-common background-gradient_" + dayclass + monthclass}>
        <div className="row">
          <img src='/logo.svg' className="img-responsive scale-logo-homepage" alt="CU Reviews Logo" />
        </div>
        <div className="row homepage-text-padding">
          <div className="col-lg-7 col-md-7 col-sm-7 col-xs-7">
            <div className="row">
              <p className="homepage-text">Search for Cornell courses, rate past classes, and share feedback</p>
            </div>
            <SearchBar />
          </div>
        </div>
        <div className="">
          <img src='/dti_logo.png' className="dti-logo" alt="DTI Logo" />
        </div>
      </div>
    );
  }
}
