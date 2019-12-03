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

    // keep track of user's inputed query to send to SearcBar. Initialize to empty string.
    this.state = {
      query: "",
    };

    // Bind function queryUpdate to this component's state. Required because updateQuery
    // changes the App component's state, but is called in another file (SearchBar component)
    // the 'this' keyword changes depending on the context of the file a function is called in,
    // so we bind this function to the App component to refence it as 'this'
    this.updateQuery.bind(this);
    document.getElementById('googleButton');
  }

    // Set the local state variable 'query' to the current value of the input (given by user)
  // Passed as a prop to SearchBar component, which calls this when user changes their query.
  updateQuery = (event) => {
    // trim the query to remove trailing spaces
    this.setState({ query: event.target.value.trim() });
    //Session to be able to get info from this.state.query in withTracker
    Session.set('querySession', this.state.query);
  }


  render() {
    return (
      <div className="container-fluid full-height background-gradient">
        <div className="row">
          <img src='/logo.svg' className="img-responsive scale-logo" alt="CU Reviews Logo" />
        </div>
        <div className="row homepage-left-padding">
          <div className="col-lg-7 col-md-7 col-sm-7 col-xs-7">
            <div className="row">
              <p className="welcome_text">Search for Cornell courses, rate past classes, and share feedback</p>
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