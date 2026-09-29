import { useState, useEffect } from "react";
import api from "../api";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState({}); // { request_id: [units] }
  const [statusMsg, setStatusMsg] = useState("");

  const fetchRequests = async () => {
    const res = await api.get("/requests");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const findMatch = async (request) => {
    try {
      const res = await api.get("/match", {
        params: {
          blood_group: request.blood_group,
          units_needed: request.units_needed,
        },
      });
      setMatches({ ...matches, [request.request_id]: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  const allotUnit = async (request_id, unit_id) => {
    try {
      const res = await api.post("/allot", { request_id, unit_id });
      setStatusMsg(res.data.message);

      // Remove the allotted unit from ALL visible match lists immediately
      const updated = {};
      for (const reqId of Object.keys(matches)) {
        updated[reqId] = matches[reqId].filter((u) => u.unit_id !== unit_id);
      }
      setMatches(updated);
      fetchRequests();
    } catch (err) {
      setStatusMsg("Allotment failed");
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Blood Requests Dashboard</h2>

      {statusMsg && (
        <p className="mb-4 text-center font-medium text-blue-700">
          {statusMsg}
        </p>
      )}

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.request_id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {req.hospital_name} — {req.blood_group} ({req.units_needed}{" "}
                  units)
                </p>
                <p className="text-sm text-gray-500">
                  Urgency: {req.urgency} | Status: {req.status}
                </p>
              </div>
              <button
                onClick={() => findMatch(req)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Find Match
              </button>
            </div>

            {matches[req.request_id] && (
              <div className="mt-3 border-t pt-3 space-y-2">
                {matches[req.request_id].length === 0 && (
                  <p className="text-sm text-gray-500">
                    No matching units available.
                  </p>
                )}
                {matches[req.request_id].map((unit) => (
                  <div
                    key={unit.unit_id}
                    className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                  >
                    <span>
                      Unit #{unit.unit_id} — {unit.blood_group} (expires{" "}
                      {unit.expiry_date?.slice(0, 10)})
                    </span>
                    <button
                      onClick={() => allotUnit(req.request_id, unit.unit_id)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Allot
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
