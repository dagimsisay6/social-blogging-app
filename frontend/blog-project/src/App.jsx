import React from "react";
import { Routes, Route } from 'react-router-dom';
import WelcomePage from "./pages/welcomePage";
import SignUpPage from './pages/signupPage';
import LoginPage from './pages/loginPage';

function App() {
  return (
    <div>
      <Routes>
        {/* Default route - Welcome Page */}
        <Route path="/" element={<WelcomePage />} />

        {/* Sign Up Page route */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* You can add more routes here as needed */}
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </div>
  );
}
export default App;