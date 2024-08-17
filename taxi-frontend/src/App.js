import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/login';
import Dashboard from './components/dashboard';
import Registration from './components/register'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Dodaj druge rute ovde */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
