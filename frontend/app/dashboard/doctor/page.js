"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import api, { getList } from "../../../src/services/api";
import { useAuth } from "../../../components/AuthProvider";
import LoadingSkeleton from "../../../components/LoadingSkeleton";
import { showToast } from "../../../components/Toast";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const data = await getList("/api/appointments/appointments/");
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/appointments/appointments/${id}/`, { status: newStatus });
      showToast(`Appointment ${newStatus.toLowerCase()} successfully!`, "success");
      fetchAppointments();
    } catch (err) {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      CONFIRMED: "badge-success",
      PENDING: "badge-warning",
      COMPLETED: "badge-primary",
      CANCELLED: "badge-danger",
    };
    return map[status] || "badge-warning";
  };

  if (loading) return <LoadingSkeleton type="page" />;

  const pending = appointments.filter((a) => a.status === "PENDING");
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED");
  const completed = appointments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-primary-500/20 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-2 relative z-10">
          Welcome, Dr. {user?.profile_details?.name || user?.username || "Doctor"} 🩺
        </h1>
        <p className="text-slate-300 relative z-10">
          Here is your schedule and patient updates for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{appointments.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{pending.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Confirmed</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{confirmed.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Completed</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{completed.length}</p>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-primary-500" />
            Appointment Schedule
          </h2>
          <button onClick={fetchAppointments} className="text-sm text-primary-600 hover:text-primary-500 font-medium">
            Refresh
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Calendar size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-medium">No appointments scheduled.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/40 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {(apt.patient_name || "P")[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {apt.patient_name || `Patient #${apt.patient}`}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {apt.date}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {apt.time || "TBD"}</span>
                    </div>
                    {apt.reason_for_visit && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                        &quot;{apt.reason_for_visit}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className={statusBadge(apt.status)}>{apt.status}</span>

                  {apt.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateStatus(apt.id, "CONFIRMED")}
                        disabled={updatingId === apt.id}
                        className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {updatingId === apt.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, "CANCELLED")}
                        disabled={updatingId === apt.id}
                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    </>
                  )}

                  {apt.status === "CONFIRMED" && (
                    <button
                      onClick={() => updateStatus(apt.id, "COMPLETED")}
                      disabled={updatingId === apt.id}
                      className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {updatingId === apt.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Complete
                    </button>
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
