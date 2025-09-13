// src/App.jsx
import './App.css';
import LiveStatusCard from './components/LiveStatusCard';
import AlertsBanner from './components/AlertsBanner';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SentiCare Wellness Dashboard</h1>
      </header>
      <main>
        <AlertsBanner />
        <LiveStatusCard />
      </main>
    </div>
  );
}

export default App;