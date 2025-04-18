import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import BrowserRouter, Routes, Route

import './index.css';
import App from './App.jsx';

// Render the application to the root element
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>  
      <App />
    </BrowserRouter>
  </StrictMode>
);
