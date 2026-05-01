"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, FileText, Plus, X, Loader2, CheckCircle, Users } from "lucide-react";
import api, { getList } from "../../../src/services/api";
import { useAuth } from "../../../components/AuthProvider";
import LoadingSkeleton from "../../../components/LoadingSkeleton";
import { showToast } from "../../../components/Toast";
import Link from "next/link";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookForm, setBookForm] = useState({ doctor: "", date: "", time: "", reason_for_visit: "" });
  const [booking, setBooking] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [aptData, recordsData] = await Promise.all([
        getList("/api/appointments/appointments/"),
        getList("/api/patients/medical-records/"),
      ]);
      setAppointments(aptData);
      setMedicalRecords(recordsData);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      showToast("Failed to load some dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const openBookingModal = async () => {
    setShowBooking(true);
    try {
      const data = await getList("/api/doctors/availability/");
      setSlots(data);
      // Extract unique doctors from slots
      const uniqueDoctors = [];
      const seen = new Set();
      data.forEach((s) => {
        if (!seen.has(s.doctor)) {
          seen.add(s.doctor);
          uniqueDoctors.push({ id: s.doctor, name: s.doctor_name || `Doctor #${s.doctor}` });
        }
      });
      setDoctors(uniqueDoctors);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      await api.post("/api/appointments/appointments/", {
        patient: user.profile_details.id,
        doctor: parseInt(bookForm.doctor),
        date: bookForm.date,
        time: bookForm.time,
        reason_for_visit: bookForm.reason_for_visit,
      });
      showToast("Appointment booked successfully!", "success");
      setShowBooking(false);
      setBookForm({ doctor: "", date: "", time: "", reason_for_visit: "" });
      fetchDashboardData();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData
        ? typeof errData === "string" ? errData : Object.values(errData).flat().join(" | ")
        : "Failed to book appointment.";
      showToast(msg, "error");
    } finally {
      setBooking(false);
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-blue-400 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-2 relative z-10">
          Hello, {user?.profile_details?.name || user?.username || "Patient"}! 👋
        </h1>
        <p className="text-primary-100 relative z-10">
          Welcome to your smart health dashboard. Here is what is happening today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Appointments</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{appointments.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {appointments.filter((a) => a.status === "PENDING").length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Records</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{medicalRecords.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Prescriptions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {medicalRecords.filter(r => r.record_type === 'PRESCRIPTION').length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointments List */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-primary-500" />
                My Appointments
              </h2>
              <button onClick={openBookingModal} className="btn-primary text-sm flex items-center gap-1 py-1.5 px-3">
                <Plus size={16} /> Book New
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Calendar size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="font-medium">No appointments yet.</p>
                <button onClick={openBookingModal} className="mt-3 text-primary-600 font-semibold hover:underline">
                  Book your first appointment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/40 text-primary-600 rounded-full flex items-center justify-center text-lg">
                        🩺
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {apt.doctor_name || `Doctor #${apt.doctor}`}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {apt.date || "TBD"}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {apt.time || "TBD"}</span>
                        </div>
                      </div>
                    </div>
                    <span className={statusBadge(apt.status)}>{apt.status || "Pending"}</span>
                  </div>
                ))}
                {appointments.length > 5 && (
                  <Link href="/dashboard/patient/appointments" className="block text-center text-sm text-primary-600 font-medium hover:underline pt-2">
                    View all appointments
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Medical Records Section */}
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <FileText className="text-primary-500" />
              Recent Medical Records
            </h2>

            {medicalRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <FileText size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="font-medium">No medical records found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{record.record_type}</span>
                      <span className="text-xs text-slate-400">{record.date_added}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{record.diagnosis || "No Diagnosis"}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{record.symptoms}</p>
                    {record.file && (
                      <a href={record.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-bold mt-3 hover:underline">
                        <Plus size={12} /> View Attachment
                      </a>
                    )}
                  </div>
                ))}
                <Link href="/dashboard/patient/records" className="block text-center text-sm text-primary-600 font-medium hover:underline pt-2">
                  View all records
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="text-primary-500" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button onClick={openBookingModal} className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-sm">
                <Plus size={16} /> Book Appointment
              </button>
              <Link href="/chat" className="w-full block text-center py-2.5 border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 rounded-xl font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm">
                💬 Chat with AI Doctor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Booking Modal ──────────────────────────────── */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBooking(false)} />
          <div className="relative bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-dark-border animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Book Appointment</h3>
              <button onClick={() => setShowBooking(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Doctor</label>
                <select
                  required
                  value={bookForm.doctor}
                  onChange={(e) => setBookForm({ ...bookForm, doctor: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookForm.date}
                    onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={bookForm.time}
                    onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason (optional)</label>
                <textarea
                  value={bookForm.reason_for_visit}
                  onChange={(e) => setBookForm({ ...bookForm, reason_for_visit: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Describe your symptoms or reason..."
                />
              </div>
              <button type="submit" disabled={booking} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {booking ? <><Loader2 size={16} className="animate-spin" /> Booking...</> : "Confirm Booking"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
