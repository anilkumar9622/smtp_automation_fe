// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'
// import { BrowserRouter } from 'react-router-dom'

// createRoot(document.getElementById('root')!).render(
//   <BrowserRouter >
//     <App />
//   </BrowserRouter >)

import './index.css';
// import React from 'react';
// Import the legacy DOM package specifically to patch it
// import * as ReactDOM from 'react-dom'; 
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

/** * MONKEY PATCH: findDOMNode
 * easy-email and its dependencies (arco-design/antd) use legacy 
 * resize observers that require this.
 */
// (ReactDOM as any).findDOMNode = (instance: any) => {
//   if (!instance) return null;
//   if (instance instanceof HTMLElement) return instance;
//   return instance.getDOMNode ? instance.getDOMNode() : instance;
// };

// Now proceed with the modern Root API
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}