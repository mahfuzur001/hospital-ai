"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, AlertCircle, CheckCircle, RefreshCw, Stethoscope, Trash2, Edit2, Search, Building2 } from "lucide-react";
import api, { getList } from "../../../../src/services/api";
import LoadingSkeleton from "../../../../components/LoadingSkeleton";
import { showToast } from "../../../../components/Toast";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    username: "", email: "", password: "", first_name: "", last_name: "",
    speciality: "", experience: 5, qualification: "", hospital_name: "", consultation_fee: 500,
  };
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await getList("/api/accounts/doctors/");
      setDoctors(data);
    } catch (e) {
      console.error("Failed to fetch doctors", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleEditClick = (doc) => {
    setEditingId(doc.user.id);
    setForm({
      username: doc.user.username,
      email: doc.user.email,
      first_name: doc.user.first_name || "",
      last_name: doc.user.last_name || "",
      password: "",
      speciality: doc.speciality || "",
      experience: doc.experience || 0,
      qualification: doc.qualification || "",
      hospital_name: doc.hospital_name || "",
      consultation_fee: doc.consultation_fee || 0,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await api.delete(`/api/accounts/admin/manage-user/${userId}/`);
      showToast("Doctor deleted successfully", "success");
      fetchDoctors();
    } catch (err) {
      showToast("Failed to delete doctor", "error");
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.user.first_name + " " + d.user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.speciality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      if (editingId) {
        const patchData = { ...form };
        if (!patchData.password) delete patchData.password;
        await api.patch(`/api/accounts/admin/manage-user/${editingId}/`, patchData);
        showToast("Doctor updated successfully!", "success");
        setEditingId(null);
      } else {
        await api.post("/api/accounts/admin/create-doctor/", form);
        showToast(`Dr. ${form.username} registered successfully!`, "success");
      }
      setForm(initialForm);
      fetchDoctors();
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = errData
        ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(" | ")
        : "Failed to save doctor.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-blue-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 relative z-10">
          <Stethoscope size={30} /> Manage Doctors
        </h1>
        <p className="text-primary-100 relative z-10">Register new doctors and view existing medical staff.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Register/Edit Form */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? "Update Doctor Info" : "Register New Doctor"}
            </h2>

            {message && (
              <div className={`flex items-start gap-3 p-3 rounded-xl mb-5 text-sm animate-fadeInUp ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}>
                {message.type === "success" ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">First Name *</label>
                  <input className="input-field" placeholder="Dr. John" required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Last Name *</label>
                  <input className="input-field" placeholder="Doe" required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Username *</label>
                  <input className="input-field" placeholder="dr_username" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                  <input type="email" className="input-field" placeholder="doctor@hospital.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              {!editingId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Password *</label>
                  <input type="password" className="input-field" placeholder="Min. 8 characters" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
              )}
              {editingId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">New Password (Optional)</label>
                  <input type="password" className="input-field" placeholder="Leave blank to keep current" minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Speciality</label>
                  <input className="input-field" placeholder="e.g. Cardiology" value={form.speciality} onChange={e => setForm({...form, speciality: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Qualification</label>
                  <input className="input-field" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Experience (yrs)</label>
                  <input type="number" className="input-field" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fee (৳)</label>
                  <input type="number" className="input-field" value={form.consultation_fee} onChange={e => setForm({...form, consultation_fee: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Hospital/Clinic Name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input-field pl-10" placeholder="e.g. Smart Hospital" value={form.hospital_name} onChange={e => setForm({...form, hospital_name: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editingId ? "Update Doctor" : "Register Doctor")}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary px-4 py-3">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Doctor List */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white shrink-0">Hospital Doctors ({doctors.length})</h2>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search doctor..." 
                  className="input-field pl-9 py-1.5 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton type="card" count={3} />
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Stethoscope size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="font-medium">No doctors found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDoctors.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xl">
                      {(doc.user.first_name || doc.user.username)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        Dr. {doc.user.first_name} {doc.user.last_name || doc.user.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {doc.speciality || 'General'} · {doc.experience} yrs exp.
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{doc.user.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditClick(doc)}
                        className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors" 
                        title="Edit Profile"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
