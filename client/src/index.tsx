import React from 'react'
import { hydrate } from 'react-dom'

import App from './App'
import './index.css'

/** 
 * SSR 
 *
 * Generates appliation component sent to the client side entry point (index.html)
as an HTML object with id "render-target".
*/

hydrate(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('render-target')
)
