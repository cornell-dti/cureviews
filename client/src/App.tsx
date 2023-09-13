import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import React from 'react'

import Login from './ui/Login'
import ClassView from './ui/ClassViewNew'
import AuthRedirect from './ui/AuthRedirect'
import Profile from './ui/Profile'

import { Home } from './modules/Home'

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Results } from './ui/Results'

import NotFound from './ui/NotFound'
import Admin from './ui/Admin'


/** 
  Generates appliation component sent to the client side entry point (index.html)
  as an HTML object with id "render-target".

  A router is generated using the react-router-dom library. This determines which component 
  the user should see based on the URL they enter.

*/
const App = () => {
  return (
    <Router>
      <div className="container-fluid full-height">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/admin" component={Admin} />
          <Route exact path="/course/:subject/:number" component={ClassView} />
          <Route exact path="/auth" component={AuthRedirect} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/results/:type/:input" component={Results} />
          <Route exact path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
