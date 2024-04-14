import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import React from 'react'

/* Importing Pages */
import { Home } from './modules/Home'
import { Course } from './modules/Course'
import { Profile } from './modules/Profile'
import { Admin } from './modules/Admin'
import { AdminCosting } from './modules/AdminCosting'

/* Importing Helpers */
import { Login } from './modules/Login'
import { Results } from './modules/Results'
import { NotFound } from './modules/NotFound'
import { AuthRedirect } from './modules/AuthRedirect'

/* Styling */
import './index.css'

/**
  A router is generated using the react-router-dom library.
  This determines which component
  the user should see based on the URL they enter.

*/

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/admin" component={Admin} />
        <Route exact path="/admin/costing" component={AdminCosting} />
        <Route exact path="/course/:subject/:number" component={Course} />
        <Route exact path="/auth" component={AuthRedirect} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/results/:type/:input" component={Results} />
        <Route exact path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  )
}

export default App
