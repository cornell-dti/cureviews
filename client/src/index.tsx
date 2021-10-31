import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import React from "react";
import { render } from "react-dom";

<<<<<<< HEAD
import Login from './ui/Login';
import ClassView from './ui/ClassView.jsx';
import App from './ui/App';
import AuthRedirect from './ui/AuthRedirect';
import Profile from './ui/Profile';
=======
import Login from "./ui/Login";
import ClassView from "./ui/ClassView.jsx";
import App from "./ui/App";
import AuthRedirect from "./ui/AuthRedirect";
>>>>>>> 21324e19300c707f028710f04633b10b594f09a7

import { BrowserRouter, Route } from "react-router-dom";
import { Results } from "./ui/Results";

/*
Generates appliation component sent to the client side entry point (main.html)
as an HTML object with id "render-target".

A router is generated using the BrowserRouter library. This determines which
application component the user should see based on the URL they enter.

*/
render(
<<<<<<< HEAD
    <BrowserRouter>
        <div className="container-fluid full-height noLeftRightPadding">
            <Route name="app" exact path="/" component={App} />
            <Route name="admin" exact path="/admin" component={Login} />
            <Route name="permalink" exact path="/course/:subject/:number" component={ClassView} />
            <Route name="auth" exact path="/auth" component={AuthRedirect} />
            <Route name="permalink" exact path="/results/:type/:input" component={Results} />
            <Route name="profile" exact path="/profile" component={Profile} />
        </div>
    </BrowserRouter>,
    document.getElementById('render-target')
=======
  <BrowserRouter>
    <div className="container-fluid full-height noLeftRightPadding">
      <Route name="app" exact path="/" component={App} />
      <Route name="admin" exact path="/admin" component={Login} />
      <Route
        name="permalink"
        exact
        path="/course/:subject/:number"
        component={ClassView}
      />
      <Route name="auth" exact path="/auth" component={AuthRedirect} />
      <Route
        name="permalink"
        exact
        path="/results/:type/:input"
        component={Results}
      />
    </div>
  </BrowserRouter>,
  document.getElementById("render-target")
>>>>>>> 21324e19300c707f028710f04633b10b594f09a7
);
