import { useState } from 'react';
import CreateRequest from './pages/CreateRequest';
import Dashboard from './pages/Dashboard';

function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex gap-4 justify-center">
        <button onClick={() => setPage('dashboard')} className="font-medium text-gray-700 hover:text-red-600">
          Dashboard
        </button>
        <button onClick={() => setPage('create')} className="font-medium text-gray-700 hover:text-red-600">
          Raise Request
        </button>
      </nav>
      {page === 'dashboard' ? <Dashboard /> : <CreateRequest />}
    </div>
  );
}

export default App;