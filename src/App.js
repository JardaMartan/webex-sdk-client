import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import MeetingView from "./components/meeting/MeetingView";
import AppHeader from "./components/header/AppHeader";
import LoginPage from "./components/login/Login";
import MeetingProvider from "./components/meetingcontext/MeetingContext";

const App = () => {
  return (
    <div className="App">
      <MeetingProvider>
        <AppHeader />
        <Routes>
          <Route exact path="/" element={<MeetingView />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MeetingProvider>
    </div>
  );
};

export default App;
