import { useState } from 'react';
import api from '../api';

const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function CreateRequest() {
  const [form, setForm] = useState({
    hospital_id: '',
    blood_group: 'A+',
    units_needed: 1,
    urgency: 'normal'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/requests', form);
      setMessage(`Request created! ID: ${res.data.request_id}`);
    } catch (err) {
      setMessage('Failed to create request');
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Raise Blood Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hospital ID</label>
          <input
            type="number"
            name="hospital_id"
            value={form.hospital_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Blood Group</label>
          <select
            name="blood_group"
            value={form.blood_group}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Units Needed</label>
          <input
            type="number"
            name="units_needed"
            min="1"
            value={form.units_needed}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Urgency</label>
          <select
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="normal">Normal</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Submit Request
        </button>

        {message && <p className="text-center text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}