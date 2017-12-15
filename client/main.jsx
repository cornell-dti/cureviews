import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App      from '../imports/ui/App.jsx';
import Login from '../imports/ui/Login.jsx';

import {BrowserRouter, Route } from "react-router-dom";

Meteor.startup(() => {
    render(
        <BrowserRouter>
            <div>
                <Route name="login" exact path="/"  component={ App } />
                <Route name="admin"  path="/admin" component={Login} />
            </div>
        </BrowserRouter>,
        document.getElementById('render-target')
    );

});
