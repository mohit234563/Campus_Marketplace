import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
// 1. IMPORT YOUR AUTH PROVIDER HERE


import SignupForm from './pages/SignupForm.jsx'
import LoginForm from './pages/LoginForm.jsx'
import LandingPage from './pages/LandingPage.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SellItemPage from './pages/SellItemPage.jsx'

const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route path='' element={<LandingPage />} />
      <Route path='home' element={<HomePage />} />
      <Route path='signup' element={<SignupForm />} />
      <Route path='login' element={<LoginForm />} />
      <Route path='profile' element={<ProfilePage />} />
      <Route path='sellItem' element={<SellItemPage />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. WRAP THE ROUTER PROVIDER HERE */}
      <RouterProvider router={route} />
  </StrictMode>,
)