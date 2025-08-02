import React from "react";
import { Routes, Route } from 'react-router-dom';

// Import your page components
import WelcomePage from "./pages/welcomePage";
import SignUpPage from './pages/signupPage';
import LoginPage from './pages/loginPage';
import ResetPasswordPage from './pages/resetPasswordPage';
import ChatbotWidget from './components/ChatbotWidget'; // Import the ChatbotWidget component

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

        {/* Route for Reset Password Page */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
      <ChatbotWidget /> {/* Render the chatbot widget here */}
    </div>
  );
}

export default App;
