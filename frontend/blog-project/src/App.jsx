import React from "react";
import { Routes, Route } from 'react-router-dom';
import WelcomePage from "./pages/welcomePage";
import SignUpPage from './pages/signupPage';
import LoginPage from './pages/loginPage';
import ResetPasswordPage from './pages/resetPasswordPage'; // Import the new component

function App() {
  return (
    <div>
      <Routes>
        {/* Default route - Welcome Page */}
        <Route path="/" element={<WelcomePage />} />

        {/* Sign Up Page route */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* Login Page route */}
        <Route path="/login" element={<LoginPage />} />

        {/* New route for Reset Password Page */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </div>
  );
}
export default App;
