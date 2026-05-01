"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import api from "../../../../src/services/api";

const STATUS_STYLES = {
  CONFIRMED: "badge-success",
  PENDING: "badge-warning",
  CANCELLED: "badge-danger",
  COMPLETED: "badge-primary",
};

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      const [profileRes, apptRes] = await Promise.all([
        api.get("/api/accounts/profile/"),
        api.get("/api/appointments/appointments/"),
      ]);
      setProfile(profileRes.data);
      const data = apptRes.data;
      setAppointments(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      console.error("Failed to fetch schedule", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      await api.patch(`/api/appointments/appointments/${appointmentId}/`, { status: newStatus });
      setAppointments(prev =>
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt)
      );
    } catch (e) {
      console.error("Failed to update appointment status", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = appointments.filter(a => a.status === "PENDING");
  const confirmed = appointments.filter(a => a.status === "CONFIRMED");
  const completed = appointments.filter(a => a.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 blur-3xl rounded-full -mr-12 -mt-12" />
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 relative z-10">
          <Calendar size={28} /> My Schedule
        </h1>
        <p className="text-slate-300 relative z-10">
          Manage your patient appointments and update their statuses.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", count: pending.length, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Confirmed", count: confirmed.length, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Completed", count: completed.length, color: "text-primary-600 dark:text-primary-400", bg: "bg-primary-50 dark:bg-primary-900/20" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 text-center border border-slate-100 dark:border-slate-700`}>
            <p className={`text-3xl font-extrabold ${color}`}>{count}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Appointments</h2>
          <button onClick={fetchData} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500">
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={24} />Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No appointments scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-lg">
                  {(apt.patient_name || apt.patient?.toString() || 'P')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {apt.patient_name || `Patient #${apt.patient}`}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {apt.date || 'TBD'}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {apt.time || 'TBD'}</span>
                  </div>
                  {apt.notes && <p className="text-xs text-slate-400 mt-1 truncate">"{apt.notes}"</p>}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={STATUS_STYLES[apt.status] || "badge-primary"}>{apt.status || "PENDING"}</span>
                  {updatingId === apt.id ? (
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  ) : (
                    <>
                      {apt.status === "PENDING" && (
                        <button
                          onClick={() => handleStatusChange(apt.id, "CONFIRMED")}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Confirm appointment"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {apt.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleStatusChange(apt.id, "COMPLETED")}
                          className="px-3 py-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleStatusChange(apt.id, "CANCELLED")}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Cancel appointment"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
