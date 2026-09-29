import { useState } from 'react';
import CreateRequest from './pages/CreateRequest';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

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
        <button onClick={() => setPage('admin')} className="font-medium text-gray-700 hover:text-red-600">
          Admin Panel
        </button>
      </nav>
      {page === 'dashboard' && <Dashboard />}
      {page === 'create' && <CreateRequest />}
      {page === 'admin' && <AdminPanel />}
    </div>
  );
}

export default App;