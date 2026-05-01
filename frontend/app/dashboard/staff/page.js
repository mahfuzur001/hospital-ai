"use client";

import { useEffect, useState } from "react";
import { ClipboardList, CheckCircle, Clock, Building2, User } from "lucide-react";
import api, { getList } from "../../../src/services/api";
import { useAuth } from "../../../components/AuthProvider";
import LoadingSkeleton from "../../../components/LoadingSkeleton";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getList("/api/appointments/appointments/");
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  // Staff dashboard is simpler — show profile info and general info
  const department = user?.profile_details?.department || "General";
  const designation = user?.profile_details?.designation || "Staff";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-2 relative z-10">
          Staff Portal 📋
        </h1>
        <p className="text-emerald-50 relative z-10">
          Welcome back, {user?.username || "Staff Member"}. Here is your workspace.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Department</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{department}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Designation</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{designation}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Status</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Active</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <ClipboardList className="text-emerald-500" />
              Appointment Management
            </h2>
            
            {loading ? (
              <LoadingSkeleton type="list" count={5} />
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <ClipboardList size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="font-medium">No appointments to manage.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 8).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {apt.patient_name || `Patient #${apt.patient}`}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Doc: {apt.doctor_name || `Dr. #${apt.doctor}`}</span>
                        <span>{apt.date} at {apt.time}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Username</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user?.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Email</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Role</span>
                <span className="badge-success">Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
