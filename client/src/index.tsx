import React from 'react'
import { render } from 'react-dom'

import App from './App'
import './index.css'

/** 
Generates appliation component sent to the client side entry point (index.html)
as an HTML object with id "render-target".

*/
render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('render-target')
)
