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
  constructor(props) {
    super(props);
  }


  render() {
    return (
      <div className="container-fluid full-height background-gradient">
        <div className="row">
          <img src='/logo.png' className="img-responsive scale-logo-homepage" alt="CU Reviews Logo" />
        </div>
        <div className="row homepage-text-padding">
          <div className="col-lg-7 col-md-7 col-sm-7 col-xs-7">
            <div className="row">
              <p className="homepage-text">Search for Cornell courses, rate past classes, and share feedback</p>
            </div>
            <SearchBar />
          </div>
        </div>
      </div>
    );
  }
}

// takes no props
App.propTypes = {};