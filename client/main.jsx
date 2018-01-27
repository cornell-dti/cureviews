import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App        from '../imports/ui/App.jsx';
import Login      from '../imports/ui/Login.jsx';
import Permalink  from '../imports/ui/Permalink.jsx';
import Home       from '../imports/ui/Home.jsx';

import { BrowserRouter, Route } from "react-router-dom";

Meteor.startup(() => {
    render(
        <BrowserRouter>
            <div>
                <Route name="app" exact path="/" component={ Home } />
                <Route name="admin" exact path="/admin" component={ Login } />
                <Route name="permalink" exact path="/course/:subject/:number" component={ Permalink } />
            </div>
        </BrowserRouter>,
        document.getElementById('render-target')
    );
});
