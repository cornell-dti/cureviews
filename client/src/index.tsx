import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import React from "react";
import { render } from "react-dom";
import Modal from "react-modal";

import Login from "./ui/Login";
import ClassView from "./ui/ClassViewNew";
import App from "./ui/App";
import AuthRedirect from "./ui/AuthRedirect";
import Profile from "./ui/Profile";

import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Results } from "./ui/Results";

import NotFound from "./ui/NotFound";
Modal.setAppElement("#render-target");

/*
Generates appliation component sent to the client side entry point (main.html)
as an HTML object with id "render-target".

A router is generated using the BrowserRouter library. This determines which
application component the user should see based on the URL they enter.

*/
render(
    <BrowserRouter>
        <div className="container-fluid full-height">
            <Switch>
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
                <Route name="profile" exact path="/profile" component={Profile} />
                <Route component={NotFound} />
            </Switch>
        </div>
    </BrowserRouter>,
    document.getElementById("render-target")
);
