import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useState } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import { Analytics } from "./pages/Analytics";
import CookieSettings from "./pages/CookieSettings";
import { LevelUpModal } from "./components/ui/LevelUpModal";
import { BadgeModal } from "./components/ui/BadgeModal";
import { CookieProvider } from "./context/CookieContext";
import CookieConsentBanner from "./components/CookieConsentBanner";
import CookiePreferencesModal from "./components/CookiePreferencesModal";
import { useAppSelector } from "./store/hooks";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  return (
    <CookieProvider>
      <LevelUpModal />
      <BadgeModal />
      <CookieConsentBanner />
      <CookiePreferencesModal />
      <Router>
        <div className="min-h-screen flex flex-col">
          {user && <Navbar onRegisterClick={() => setShowRegister(true)} onLoginClick={() => setShowLogin(true)} />}
          {/* <XpBar /> */}
          <Register showModal={showRegister} setShowModal={setShowRegister} onLoginClick={() => setShowLogin(true)} />
          <Login showModal={showLogin} setShowModal={setShowLogin} onRegisterClick={() => setShowRegister(true)} />
          <main className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Routes>
              <Route path="/" element={<Home onRegisterClick={() => setShowRegister(true)} onLoginClick={() => setShowLogin(true)} />} />
              <Route path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cookie-settings"
                element={
                  <ProtectedRoute>
                    <CookieSettings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CookieProvider>
  )
}

export default App
