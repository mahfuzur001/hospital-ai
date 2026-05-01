"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Loader2, RefreshCw, Trash2, CheckCircle, Clock, XCircle, Search, Filter } from "lucide-react";
import api, { getList } from "../../../../src/services/api";
import LoadingSkeleton from "../../../../components/LoadingSkeleton";
import { showToast } from "../../../../components/Toast";

const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getList("/api/appointments/appointments/");
      setAppointments(data);
    } catch (e) {
      console.error("Failed to fetch appointments", e);
      showToast("Failed to fetch appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/api/appointments/appointments/${id}/`, { status: newStatus });
      showToast(`Appointment marked as ${newStatus}`, "success");
      fetchAppointments();
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await api.delete(`/api/appointments/appointments/${id}/`);
      showToast("Appointment deleted", "success");
      fetchAppointments();
    } catch (err) {
      showToast("Failed to delete appointment", "error");
    }
  };

  const filtered = appointments.filter(a => {
    const matchesSearch = 
      a.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 relative z-10">
          <CalendarDays size={30} /> Manage Appointments
        </h1>
        <p className="text-indigo-100 relative z-10">Monitor and manage all hospital appointments.</p>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search doctor, patient or reason..." 
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="input-field max-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button onClick={fetchAppointments} className="btn-secondary flex items-center gap-2 shrink-0">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <CalendarDays size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-medium">No appointments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Doctor</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900 dark:text-white leading-tight">{a.patient_name || "Anonymous"}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]" title={a.reason}>{a.reason}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">Dr. {a.doctor_name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{a.date}</p>
                      <p className="text-xs text-slate-500">{a.time}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[a.status] || ""}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {a.status === 'PENDING' && (
                          <button 
                            onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" 
                            title="Confirm"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}
                            className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all" 
                            title="Cancel"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(a.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
