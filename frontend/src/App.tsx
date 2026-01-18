import { useState, useEffect } from 'react';
import CustomerManagement from './components/CustomerManagement';
import ServiceManagement from './components/ServiceManagement';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'customers' | 'services'>('customers');
  const [serviceNavigation, setServiceNavigation] = useState<{ serviceId?: string; customerId?: string } | null>(null);

  useEffect(() => {
    const handleNavigateToService = (event: CustomEvent) => {
      setActiveTab('services');
      setServiceNavigation({ serviceId: event.detail.serviceId });
    };

    const handleNavigateToServices = (event: CustomEvent) => {
      setActiveTab('services');
      setServiceNavigation({ customerId: event.detail.customerId });
    };

    window.addEventListener('navigate-to-service', handleNavigateToService as EventListener);
    window.addEventListener('navigate-to-services', handleNavigateToServices as EventListener);

    return () => {
      window.removeEventListener('navigate-to-service', handleNavigateToService as EventListener);
      window.removeEventListener('navigate-to-services', handleNavigateToServices as EventListener);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>SwipingSkimmer</h1>
        <p>Pool Service Management Platform</p>
        <nav className="main-nav">
          <button
            className={activeTab === 'customers' ? 'active' : ''}
            onClick={() => {
              setActiveTab('customers');
              setServiceNavigation(null);
            }}
          >
            Customers
          </button>
          <button
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => {
              setActiveTab('services');
              setServiceNavigation(null);
            }}
          >
            Services
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'customers' ? (
          <CustomerManagement />
        ) : (
          <ServiceManagement initialNavigation={serviceNavigation} />
        )}
      </main>
    </div>
  );
}

export default App;
