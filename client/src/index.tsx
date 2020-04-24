import "./jQuery";
import "./index.css";

import React from 'react';
import { Meteor } from "./meteor-shim";
import { render } from 'react-dom';

import Login              from './ui/Login.jsx';
import ClassView          from './ui/ClassView.jsx';
import App                from './ui/App';
import AuthRedirect       from './ui/AuthRedirect.jsx';

import { BrowserRouter, Route } from "react-router-dom";
import { Results } from './ui/Results.jsx';

/*
Generates appliation component sent to the client side entry point (main.html)
as an HTML object with id "render-target".

A router is generated using the BrowserRouter library. This determines which
application component the user should see based on the URL they enter.

*/
Meteor.setup();
Meteor.startup(() => {
    render(
        <BrowserRouter>
            <div className="container-fluid full-height noLeftRightPadding">
                <Route name="app" exact path="/" component={App} />
                <Route name="admin" exact path="/admin" component={Login} />
                <Route name="permalink" exact path="/course/:subject/:number" component={ClassView} />
                <Route name="auth" exact path="/auth" component={ AuthRedirect } />
                <Route name="permalink" exact path="/results/:type/:input" component={Results} />
            </div>
        </BrowserRouter>,
        document.getElementById('render-target')
    );
});
