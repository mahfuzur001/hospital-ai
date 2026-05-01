"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, Users, Stethoscope, Building2, CalendarDays, 
  ArrowRight, Loader2, TrendingUp, Clock, AlertCircle
} from "lucide-react";
import api, { getList } from "../../../src/services/api";
import Link from "next/link";
import LoadingSkeleton from "../../../components/LoadingSkeleton";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/accounts/admin/stats/");
      setStats(res.data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const StatCard = ({ title, value, icon: Icon, color, href }) => (
    <Link href={href} className="group">
      <div className="card hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 h-full relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity rounded-full bg-current ${color}`} />
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100 shadow-sm`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
          </div>
          <ArrowRight size={18} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {loading ? <Loader2 className="animate-spin" size={24} /> : value}
        </p>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <ShieldAlert className="text-primary-400" size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-300">Administrative Dashboard</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Welcome back, Admin.</h1>
          <p className="text-slate-300 max-w-lg">Monitor hospital operations, manage medical staff, and oversee patient appointments from your central control center.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Doctors" 
          value={stats?.total_doctors} 
          icon={Stethoscope} 
          color="bg-blue-500"
          href="/dashboard/admin/doctors"
        />
        <StatCard 
          title="Total Patients" 
          value={stats?.total_patients} 
          icon={Users} 
          color="bg-emerald-500"
          href="/dashboard/admin/patients"
        />
        <StatCard 
          title="Hospital Staff" 
          value={stats?.total_staff} 
          icon={Building2} 
          color="bg-purple-500"
          href="/dashboard/admin/staff"
        />
        <StatCard 
          title="All Appointments" 
          value={stats?.total_appointments} 
          icon={CalendarDays} 
          color="bg-indigo-500"
          href="/dashboard/admin/appointments"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp size={22} className="text-primary-500" />
              Activity Overview
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Today's Appointments</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.today_appointments || 0}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-inner">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Requests</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.pending_appointments || 0}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary-600 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-primary-500/20">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert size={120} />
              </div>
              <h3 className="text-xl font-bold mb-2">Need to add new staff?</h3>
              <p className="text-primary-100 mb-6 text-sm max-w-md">Quickly register new doctors, receptionists, or lab technicians to keep the hospital running smoothly.</p>
              <div className="flex gap-3">
                <Link href="/dashboard/admin/doctors" className="px-4 py-2 bg-white text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-50 transition-colors">
                  Add Doctor
                </Link>
                <Link href="/dashboard/admin/staff" className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-400 transition-colors">
                  Add Staff
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / System Info */}
        <div className="space-y-6">
          <div className="card bg-slate-900 text-white border-none">
            <h2 className="text-lg font-bold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Database</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">AI Engine</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Server Time</span>
                <span className="text-slate-200">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="card border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <CalendarDays size={32} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Weekly Reports</h3>
            <p className="text-xs text-slate-500 mb-4 px-6">Detailed analytics for the past 7 days are being generated.</p>
            <button className="text-primary-500 text-xs font-bold hover:underline">Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
