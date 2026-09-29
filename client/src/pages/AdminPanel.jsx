import { useState, useEffect } from "react";
import api from "../api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AdminPanel() {
  const [units, setUnits] = useState([]);
  const [donors, setDonors] = useState([]);
  const [banks, setBanks] = useState([]);
  const [message, setMessage] = useState("");

  const [donorForm, setDonorForm] = useState({
    name: "",
    blood_group: "A+",
    phone: "",
  });
  const [unitForm, setUnitForm] = useState({
    donor_id: "",
    bank_id: "",
    blood_group: "A+",
    shelf_life_days: 42,
  });

  const fetchAll = async () => {
    const [u, d, b] = await Promise.all([
      api.get("/units"),
      api.get("/donors"),
      api.get("/banks"),
    ]);
    setUnits(u.data);
    setDonors(d.data);
    setBanks(b.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const statusColor = (status) => {
    if (status === "available") return "bg-green-100 text-green-700";
    if (status === "allotted") return "bg-blue-100 text-blue-700";
    if (status === "expired") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const daysToExpiry = (dateStr) => {
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  const addDonor = async (e) => {
    e.preventDefault();
    try {
      await api.post("/donors", donorForm);
      setMessage("Donor added successfully");
      setDonorForm({ name: "", blood_group: "A+", phone: "" });
      fetchAll();
    } catch (err) {
      setMessage("Failed to add donor");
    }
  };

  const addUnit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/units", unitForm);
      setMessage("Blood unit added successfully");
      fetchAll();
    } catch (err) {
      setMessage("Failed to add unit");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 space-y-8">
      <h2 className="text-xl font-bold">Admin Panel</h2>
      {message && <p className="text-blue-700 font-medium">{message}</p>}

      {/* Forms side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Donor */}
        <form
          onSubmit={addDonor}
          className="bg-white p-4 rounded shadow space-y-3"
        >
          <h3 className="font-semibold">Add Donor</h3>
          <input
            placeholder="Name"
            value={donorForm.name}
            onChange={(e) =>
              setDonorForm({ ...donorForm, name: e.target.value })
            }
            required
            className="w-full border rounded px-3 py-2"
          />
          <select
            value={donorForm.blood_group}
            onChange={(e) =>
              setDonorForm({ ...donorForm, blood_group: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
          <input
            placeholder="Phone"
            value={donorForm.phone}
            onChange={(e) =>
              setDonorForm({ ...donorForm, phone: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
            Add Donor
          </button>
        </form>

        {/* Add Blood Unit */}
        <form
          onSubmit={addUnit}
          className="bg-white p-4 rounded shadow space-y-3"
        >
          <h3 className="font-semibold">Add Blood Unit</h3>
          <select
            value={unitForm.donor_id}
            onChange={(e) =>
              setUnitForm({ ...unitForm, donor_id: e.target.value })
            }
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Donor</option>
            {donors.map((d) => (
              <option key={d.donor_id} value={d.donor_id}>
                {d.name} ({d.blood_group})
              </option>
            ))}
          </select>
          <select
            value={unitForm.bank_id}
            onChange={(e) =>
              setUnitForm({ ...unitForm, bank_id: e.target.value })
            }
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Bank</option>
            {banks.map((b) => (
              <option key={b.bank_id} value={b.bank_id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={unitForm.blood_group}
            onChange={(e) =>
              setUnitForm({ ...unitForm, blood_group: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Shelf life (days)"
            value={unitForm.shelf_life_days}
            onChange={(e) =>
              setUnitForm({ ...unitForm, shelf_life_days: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
            Add Unit
          </button>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <h3 className="font-semibold p-4 border-b">Blood Inventory</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Unit ID</th>
              <th className="text-left p-2">Group</th>
              <th className="text-left p-2">Donor</th>
              <th className="text-left p-2">Bank</th>
              <th className="text-left p-2">Expiry</th>
              <th className="text-left p-2">Days Left</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.unit_id} className="border-t">
                <td className="p-2">#{u.unit_id}</td>
                <td className="p-2">{u.blood_group}</td>
                <td className="p-2">{u.donor_name}</td>
                <td className="p-2">{u.bank_name}</td>
                <td className="p-2">{u.expiry_date?.slice(0, 10)}</td>
                <td className="p-2">{daysToExpiry(u.expiry_date)}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusColor(u.status)}`}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
