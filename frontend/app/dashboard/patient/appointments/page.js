"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Loader2, AlertCircle, X, CheckCircle } from "lucide-react";
import api, { getList } from "../../../../src/services/api";

const STATUS_STYLES = {
  CONFIRMED: "badge-success",
  PENDING: "badge-warning",
  CANCELLED: "badge-danger",
  COMPLETED: "badge-primary",
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctor: "", date: "", time: "", reason_for_visit: "" });
  const [allSlots, setAllSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    try {
      const [apptData, slots] = await Promise.all([
        getList("/api/appointments/appointments/"),
        getList("/api/doctors/availability/"),
      ]);
      setAppointments(apptData);
      setAllSlots(slots);
      // Extract unique doctors from availability slots
      const seen = new Set();
      const uniqueDocs = [];
      slots.forEach(s => {
        if (!seen.has(s.doctor)) {
          seen.add(s.doctor);
          uniqueDocs.push({ id: s.doctor, name: s.doctor_name || `Doctor #${s.doctor}` });
        }
      });
      setDoctors(uniqueDocs);
    } catch (e) {
      console.error("Failed to fetch appointments", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post("/api/appointments/appointments/", form);
      setMessage({ type: "success", text: "Appointment booked successfully!" });
      setForm({ doctor: "", date: "", time: "", reason_for_visit: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = errData
        ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(" | ")
        : "Failed to book appointment.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Calendar size={28} /> My Appointments
        </h1>
        <p className="text-primary-100">View and manage your upcoming medical appointments.</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
          message.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)}><X size={14} /></button>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Appointments ({appointments.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            <Plus size={16} /> Book New
          </button>
        </div>

        {/* Book Form */}
        {showForm && (
          <div className="mb-6 p-5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Book an Appointment</h3>
            <form onSubmit={handleBook} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Select Doctor *</label>
                <select className="input-field" required value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})}>
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date *</label>
                <input type="date" className="input-field" required value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Time *</label>
                <input type="time" className="input-field" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reason / Notes (optional)</label>
                <input className="input-field" placeholder="Describe your symptoms briefly" value={form.reason_for_visit} onChange={e => setForm({...form, reason_for_visit: e.target.value})} />
              </div>

              {/* Doctor Availability Display */}
              {form.doctor && (
                <div className="md:col-span-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-primary-100 dark:border-primary-900/50">
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={14} /> Doctor's Weekly Schedule
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {allSlots.filter(s => s.doctor === parseInt(form.doctor)).length > 0 ? (
                      allSlots.filter(s => s.doctor === parseInt(form.doctor)).map((s, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-900/30 text-center">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.day}</p>
                          <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-0.5">{s.start_time?.slice(0,5)} - {s.end_time?.slice(0,5)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 col-span-full italic">No specific availability set. You can try booking any time.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-10 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={24} />Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No appointments yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-primary-600 dark:text-primary-400 font-semibold hover:underline text-sm">
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl">
                  👨‍⚕️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {apt.doctor_name ? `Dr. ${apt.doctor_name}` : `Doctor #${apt.doctor}`}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {apt.date || 'TBD'}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {apt.time || 'TBD'}</span>
                  </div>
                  {apt.notes && <p className="text-xs text-slate-400 mt-1 truncate">"{apt.notes}"</p>}
                </div>
                <span className={STATUS_STYLES[apt.status] || "badge-primary"}>
                  {apt.status || "PENDING"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
