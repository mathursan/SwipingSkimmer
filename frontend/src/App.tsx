import React from 'react';
import CustomerManagement from './components/CustomerManagement';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SwipingSkimmer</h1>
        <p>Pool Service Management Platform</p>
      </header>
      <main>
        <CustomerManagement />
      </main>
    </div>
  );
}

export default App;
