// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import Home from './pages/home/HomePage';
import Analytics from './pages/analytics/AnalyticsPage';
import './App.css';

function App() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;