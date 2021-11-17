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
    const sunset_start_times = [17.0, 17.5, 18, 19.5, 20, 20.5, 20.5, 19.5, 18.5, 18, 16.5, 16.5];
    const sunset_end_times = [18.5, 19, 20.5, 21, 22, 22, 22, 21.5, 20.5, 20, 19, 18];
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
      monthclass = "winter"
    }

    else if (month > 7) {
      monthclass = "fall"
    }

    else if (month > 4) {
      monthclass = "summer"
    }

    else {
      monthclass = "spring"
    }

    if (time_of_day < 6 || time_of_day >= sunset_end_times[month]) {
      dayclass = "night"
    }

    else if (time_of_day >= sunset_start_times[month]) {
      dayclass = "sunset"
    }

    return (
      <div className={"container-fluid full-height background-common background-gradient_" + dayclass + monthclass}>
        <div className="row">
          <img src='/logo.svg' className="img-fluid scale-logo-homepage" alt="CU Reviews Logo" />
        </div>
        <div className="row homepage-text-padding">
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12 col-12">
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
