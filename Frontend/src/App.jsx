// import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import SellItemPage from "./pages/SellItemPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import Publicprofilepage from "./pages/Publicprofilepage.jsx";

// Redirect to /login if not authenticated
const Protected = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

// Redirect to /home if already logged in
const AuthRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? <Navigate to="/home" replace /> : children;
};

function AppRoutes() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
                <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
                <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />

                {/* Protected */}
                <Route path="/sell" element={<Protected><SellItemPage /></Protected>} />
                <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
                <Route path="/my-listings" element={<Protected><ProfilePage defaultTab="listings" /></Protected>} />
                <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />

                {/* Public seller profile — no auth needed */}
                <Route path="/u/:username" element={<Publicprofilepage />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;