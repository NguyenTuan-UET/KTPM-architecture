import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './utils/App.jsx';
import MonitorHealth from './utils/MonitorHealth.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="container">
      <App />
      <MonitorHealth />
    </div>
  </StrictMode>
);
