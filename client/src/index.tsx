import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import './index.css'

/** 
 * SSR 
 *
 * Generates appliation component sent to the client side entry point (index.html)
as an HTML object with id "render-target".
*/

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);