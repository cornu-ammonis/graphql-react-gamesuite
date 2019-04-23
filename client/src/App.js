import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Coin from './Coin';

class App extends Component {
  
  render() {
    const route = window.location.pathname.split('/')[1];

    if (route === 'coin')
      return (
        <div className="App">
          <Coin/>
        </div>
      );

    return (
      <div className="App">
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
}

export default App;
