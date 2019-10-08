import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';

/*
Course Component.

Simple styling component that represents a single course (an li element).
Used to list courses in the results of a search in SearchBar.

If a query is provided as a prop, the component is a seach result, so we underline
and boldface the query text within the title of the course.

Clicking this component will change the route of the app to render the course's ClassView.
*/

export default class AuthRedirect extends Component {
  constructor(props) {
    super(props);

    // grabs class number and subject from the GET parameters
    
    const google_hash = this.props.location.hash;
    if(google_hash !== ""){
      const google_token = google_hash.match(/(?<=id_token=)([^&]+)/)[0];
      this.saveToken(google_token);
    }
  }
  
  //Using meteor session to save the token to Session
  saveToken(token) {
    Session.setPersistent({"token": token});
    if (Session.get("token") !== token){
      console.log("Error saving token to session")
      return 0;
    }
    return 1;
  }
  
  render() {
    if(Session.get("redirectFrom") === "course"){
      return <Redirect push to={`/course/${Session.get("review_major")}/${Session.get("review_num")}`}></Redirect>
    }
    else if(Session.get("redirectFrom") === "admin"){
      return <Redirect push to={"/admin"}></Redirect>
    }
    else{
      return <Redirect push to={"/"}></Redirect>
    }
    
  }
}

// Requres course informaiton (database object) to generate course title, and uses the query to
// determine styling of output
AuthRedirect.propTypes = {};
