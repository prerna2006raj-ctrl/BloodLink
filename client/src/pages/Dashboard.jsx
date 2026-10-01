import { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState({}); // { request_id: [units] }
  const [statusMsg, setStatusMsg] = useState('');
  const [loadingMatch, setLoadingMatch] = useState({}); // { request_id: bool }
  const [allotting, setAllotting] = useState({}); // { unit_id: bool }

  const fetchRequests = async () => {
    const res = await api.get('/requests');
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const findMatch = async (request) => {
    setLoadingMatch(prev => ({ ...prev, [request.request_id]: true }));
    try {
      const res = await api.get('/match', {
        params: { blood_group: request.blood_group, units_needed: request.units_needed }
      });
      setMatches(prev => ({ ...prev, [request.request_id]: res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatch(prev => ({ ...prev, [request.request_id]: false }));
    }
  };

  const allotUnit = async (request_id, unit_id) => {
    setAllotting(prev => ({ ...prev, [unit_id]: true }));
    try {
      const res = await api.post('/allot', { request_id, unit_id });
      setStatusMsg(res.data.message);

      const updated = {};
      for (const reqId of Object.keys(matches)) {
        updated[reqId] = matches[reqId].filter(u => u.unit_id !== unit_id);
      }
      setMatches(updated);
      fetchRequests();
    } catch (err) {
      setStatusMsg('Allotment failed');
      console.error(err);
    } finally {
      setAllotting(prev => ({ ...prev, [unit_id]: false }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Blood Requests Dashboard</h2>

      {statusMsg && (
        <p className="mb-4 text-center font-medium text-blue-700">{statusMsg}</p>
      )}

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.request_id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {req.hospital_name} — {req.blood_group} ({req.units_needed} units)
                </p>
                <p className="text-sm text-gray-500">
                  Urgency: {req.urgency} | Status: {req.status}
                </p>
              </div>
              <button
                onClick={() => findMatch(req)}
                disabled={loadingMatch[req.request_id]}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMatch[req.request_id] && (
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loadingMatch[req.request_id] ? 'Searching...' : 'Find Match'}
              </button>
            </div>

            {matches[req.request_id] && (
              <div className="mt-3 border-t pt-3 space-y-2">
                {matches[req.request_id].length === 0 && (
                  <p className="text-sm text-gray-500">No matching units available.</p>
                )}
                {matches[req.request_id].map((unit) => (
                  <div
                    key={unit.unit_id}
                    className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                  >
                    <span>
                      Unit #{unit.unit_id} — {unit.blood_group} (expires {unit.expiry_date?.slice(0,10)})
                    </span>
                    <button
                      onClick={() => allotUnit(req.request_id, unit.unit_id)}
                      disabled={allotting[unit.unit_id]}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {allotting[unit.unit_id] && (
                        <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {allotting[unit.unit_id] ? 'Allotting...' : 'Allot'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}