import React from 'react';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
      <MainLayout>
        <LandingPage />
      </MainLayout>
  );
}

export default App;