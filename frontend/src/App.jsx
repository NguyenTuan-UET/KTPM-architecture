import { Routes, Route } from 'react-router-dom'; 
import Home from './utils/Home.jsx';
import MonitorHealth from './utils/MonitorHealth.jsx';

function App() {
  return (
    <div className="app">
      <Routes>  {/* Sử dụng Routes để chứa tất cả các Route */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/health" element={<MonitorHealth />} />
      </Routes>
    </div>
  );
}

export default App;
