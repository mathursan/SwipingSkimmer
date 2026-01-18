import { useState } from 'react';
import CustomerManagement from './components/CustomerManagement';
import ServiceManagement from './components/ServiceManagement';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'customers' | 'services'>('customers');

  return (
    <div className="App">
      <header className="App-header">
        <h1>SwipingSkimmer</h1>
        <p>Pool Service Management Platform</p>
        <nav className="main-nav">
          <button
            className={activeTab === 'customers' ? 'active' : ''}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
          <button
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'customers' ? <CustomerManagement /> : <ServiceManagement />}
      </main>
    </div>
  );
}

export default App;
