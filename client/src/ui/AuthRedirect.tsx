import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Session } from '../session-store';

/*
Auth Redirect Component.

Component mainly for accepting user redirect from Google and redirecting user back to
the appropriate class (eg. /course/CS/2110) or admin page (eg. /admin)

Saves Google ID Token from URL parameters when Google redirects user back to this page
(eg. /auth/#id_token=abcd123)

*/

type Props = { location: { hash: string } };

export default class AuthRedirect extends Component<Props> {
  constructor(props: Props) {
    super(props);

    const google_hash = this.props.location.hash;
    if (google_hash !== "") {
      const google_token = google_hash.match(/(?=id_token=)([^&]+)/)![0].split("=")[1];
      this.saveToken(google_token);
    }
  }

  //Using meteor session to save the token to Session
  saveToken(token: string) {
    Session.setPersistent({ "token": token });
    if (Session.getToken() !== token) {
      console.log("Error saving token to session")
      return 1;
    }
    return 0;
  }

  render() {
    if (Session.get("redirectFrom") === "course") {
      return <Redirect push to={`/course/${Session.get("review_major")}/${Session.get("review_num")}`}></Redirect>
    }
    else if (Session.get("redirectFrom") === "admin") {
      return <Redirect push to={"/admin"}></Redirect>
    }
    else {
      return <Redirect push to={"/"}></Redirect>
    }

  }
}
