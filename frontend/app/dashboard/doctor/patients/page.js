"use client";

import { useState, useEffect } from "react";
import { Loader2, Users } from "lucide-react";
import api from "../../../../src/services/api";

export default function DoctorPatientsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/appointments/appointments/");
        const data = res.data;
        setAppointments(Array.isArray(data) ? data : (data.results || []));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Unique patients
  const uniquePatients = appointments.reduce((acc, apt) => {
    if (!acc.find(a => a.patient === apt.patient)) acc.push(apt);
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3"><Users size={28} /> My Patients</h1>
        <p className="text-slate-300">View all patients who have booked appointments with you.</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Patient List ({uniquePatients.length})</h2>
        {loading ? (
          <div className="text-center py-10 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={24} /></div>
        ) : uniquePatients.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Users size={40} className="mx-auto mb-3 opacity-40" />
            <p>No patients yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uniquePatients.map((apt) => (
              <div key={apt.patient} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-lg">
                  {(apt.patient_name || apt.patient?.toString() || 'P')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{apt.patient_name || `Patient #${apt.patient}`}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {appointments.filter(a => a.patient === apt.patient).length} appointment(s) total
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  apt.status === "COMPLETED" ? "badge-primary" : apt.status === "CONFIRMED" ? "badge-success" : "badge-warning"
                }`}>
                  Last: {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
