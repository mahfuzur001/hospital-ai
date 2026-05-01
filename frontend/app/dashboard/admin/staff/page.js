"use client";

import { useState, useEffect } from "react";
import { Building2, Loader2, AlertCircle, CheckCircle, RefreshCw, Trash2, Search, Edit2 } from "lucide-react";
import api from "../../../../src/services/api";
import LoadingSkeleton from "../../../../components/LoadingSkeleton";
import { showToast } from "../../../../components/Toast";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    username: "", email: "", password: "", first_name: "", last_name: "",
    department: "", designation: "",
  };
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/accounts/staffs/");
      const data = res.data;
      setStaff(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      console.error("Failed to fetch staff", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleEditClick = (s) => {
    setEditingId(s.user.id);
    setForm({
      username: s.user.username,
      email: s.user.email,
      password: "",
      first_name: s.user.first_name || "",
      last_name: s.user.last_name || "",
      department: s.department || "",
      designation: s.designation || "",
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this staff account?")) return;
    try {
      await api.delete(`/api/accounts/admin/manage-user/${userId}/`);
      showToast("Staff deleted successfully", "success");
      fetchStaff();
    } catch (err) {
      showToast("Failed to delete staff", "error");
    }
  };

  const filteredStaff = staff.filter(s => 
    s.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.user.first_name + " " + s.user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
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
        showToast("Staff updated successfully!", "success");
        setEditingId(null);
      } else {
        await api.post("/api/accounts/admin/create-staff/", {
          ...form,
          role: "STAFF",
        });
        showToast(`${form.first_name || form.username} registered as staff!`, "success");
      }
      setForm(initialForm);
      fetchStaff();
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = errData
        ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(" | ")
        : "Failed to save staff.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const deptColors = {
    Reception: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Pharmacy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Lab: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/5 blur-3xl rounded-full" />
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 relative z-10">
          <Building2 size={30} /> Manage Staff
        </h1>
        <p className="text-slate-300 relative z-10">Register and manage hospital administrative staff.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Register/Edit Form */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? "Update Staff Info" : "Register New Staff"}
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
                  <input className="input-field" placeholder="Jane" required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Last Name *</label>
                  <input className="input-field" placeholder="Smith" required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Username *</label>
                  <input className="input-field" placeholder="staff_jane" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                  <input type="email" className="input-field" placeholder="staff@hospital.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {editingId ? "New Password (Optional)" : "Password *"}
                </label>
                <input type="password" className="input-field" placeholder={editingId ? "Leave blank to keep" : "Min. 8 characters"} required={!editingId} minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Department</label>
                  <input className="input-field" placeholder="e.g. Reception" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Designation</label>
                  <input className="input-field" placeholder="e.g. Manager" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editingId ? "Update Staff" : "Register Staff")}
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

        {/* Staff List */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white shrink-0">All Staff ({staff.length})</h2>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  className="input-field pl-9 py-1.5 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton type="card" count={3} />
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                No staff found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStaff.map((s) => {
                  const dept = s.department || 'General';
                  const colorClass = deptColors[dept] || deptColors.default;
                  return (
                    <div key={s.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-lg">
                        {(s.user?.username || 'S')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {s.user?.first_name} {s.user?.last_name || `@${s.user?.username}`}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {s.designation || 'Staff'} · {s.user?.email || ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${colorClass}`}>
                          {dept}
                        </span>
                        <button 
                          onClick={() => handleEditClick(s)}
                          className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} className="hidden" /> {/* Wait, Edit2 is not imported in my instruction? Oh I added it earlier to staff page? No, I only added Trash2 and Search. */}
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.user.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
