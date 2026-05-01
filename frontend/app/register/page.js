"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../src/services/api";
import { Activity, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/accounts/register/", formData);
      setSuccess(true);
      setTimeout(() => { router.push("/login"); }, 2000);
    } catch (err) {
      if (err.response?.data) {
        const firstErrorKey = Object.keys(err.response.data)[0];
        const msg = err.response.data[firstErrorKey];
        setError(`${firstErrorKey}: ${Array.isArray(msg) ? msg[0] : msg}`);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-dark-border">
          
          {/* Left: Branding Panel */}
          <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Activity size={28} />
                </div>
                <span className="text-2xl font-bold">SmartHospital</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                Start Your Digital Health Journey
              </h2>
              <p className="text-emerald-100 text-lg leading-relaxed">
                Create your patient account and get instant access to our network of expert doctors and AI consultations.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-emerald-100">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
                  <span>Free Patient Account</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
                  <span>Book Appointments Instantly</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
                  <span>Access AI Health Consultation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <div className="md:hidden flex items-center gap-2 mb-6">
                <div className="bg-primary-500 text-white p-1.5 rounded-lg">
                  <Activity size={22} />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">SmartHospital</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an Account</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Join our smart hospital portal as a patient</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-6 border border-red-200 dark:border-red-800 animate-fadeInUp">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-xl text-sm mb-6 border border-green-200 dark:border-green-800 animate-fadeInUp flex items-center gap-2">
                <CheckCircle size={16} />
                Registration successful! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="register-username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field pl-11"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="register-password"
                    type={showPw ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-11 pr-11"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading || success}
                className="w-full btn-primary flex justify-center py-3 text-base"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Patient Account"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
