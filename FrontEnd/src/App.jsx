import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BedDetails from './pages/BedDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bed/:bedId" element={<BedDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
