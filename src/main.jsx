// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './App.jsx';
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter><App /></BrowserRouter>
// );

/**
 * main.jsx
 * --------------------------------------------------------------------
 * CodeSync client entry point.
 *
 * Responsibilities
 * ----------------
 * • Creates the React root using ReactDOM.createRoot().
 * • Mounts the application into the #root element.
 * • Wraps the application with BrowserRouter.
 * • Imports the global stylesheet.
 *
 * Notes
 * -----
 * BrowserRouter lives here so the routing context is created once for
 * the entire application. App.jsx only defines the route tree.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';

import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);