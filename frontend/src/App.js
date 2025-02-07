<<<<<<< HEAD
import React from "react";
import MainPage from "./MainPage"; // Since it's in src, no need for components folder
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from './SignupPage'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
=======
import React from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './components/Header';  // 引入 Header 组件

function App() {
  return (
    <div className="App">
      <Header />  {/* 添加 Header 组件 */}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  ); 
>>>>>>> main
}

export default App;

