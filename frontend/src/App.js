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
}

export default App;

