import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import MeetingManager from "./components/meeting/MeetingManager";
import AppHeader from "./components/header/AppHeader";
import LoginPage from "./components/login/Login";
// import Test from "./components/meeting/Test";

function App() {
  return (
    <div className="App">
      <AppHeader />
      <Routes>
        <Route exact path="/" element={<MeetingManager />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
