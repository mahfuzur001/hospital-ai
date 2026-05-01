import Navbar from '../components/Navbar';
import Link from 'next/link';
import { ArrowRight, Activity, ShieldPlus, Clock, Heart, Users, Bed, Bot } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Clock,
      title: "Instant Booking",
      desc: "Book appointments with top doctors instantly without waiting in long queues.",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: Bot,
      title: "AI Doctor Consult",
      desc: "Get preliminary medical advice and guidance from our advanced AI Doctor model.",
      gradient: "from-violet-500 to-purple-400",
    },
    {
      icon: ShieldPlus,
      title: "Secure Records",
      desc: "Your medical history and prescriptions are securely stored and easily accessible.",
      gradient: "from-emerald-500 to-teal-400",
    },
  ];

  const stats = [
    { icon: Users, value: "200+", label: "Expert Doctors", color: "text-blue-500" },
    { icon: Heart, value: "50K+", label: "Happy Patients", color: "text-rose-500" },
    { icon: Bed, value: "500+", label: "Hospital Beds", color: "text-emerald-500" },
    { icon: Activity, value: "24/7", label: "AI Consultation", color: "text-violet-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* ─── Hero Section ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 pt-20 pb-32">
          {/* Decorative blobs */}
          <div className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] bg-primary-200 dark:bg-primary-900/30 blur-[120px] opacity-60 rounded-full pointer-events-none" />
          <div className="absolute bottom-[-80px] right-1/4 w-[400px] h-[400px] bg-violet-200 dark:bg-violet-900/20 blur-[100px] opacity-50 rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-8 animate-fadeInUp">
              <Activity size={16} />
              <span>Smart Hospital Management System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 animate-fadeInUp">
              Healthcare at your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-blue-400 to-cyan-400">
                Fingertips
              </span>
            </h1>

            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 animate-fadeInUp">
              Book appointments, consult with AI-powered doctors, and manage your
              medical records seamlessly in one secure platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp">
              <Link
                href="/register"
                className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4 animate-pulse-glow"
              >
                Get Started
                <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="btn-outline text-lg px-8 py-4">
                Patient Portal
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Stats Bar ────────────────────────────────── */}
        <section className="bg-white dark:bg-dark-card border-y border-slate-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center group">
                    <Icon
                      size={32}
                      className={`mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                    />
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Features Section ─────────────────────────── */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Why Choose Smart Hospital?
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Experience the future of healthcare with our cutting-edge
                features.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="card hover:-translate-y-2 transition-all duration-300 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={26} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ──────────────────────────────── */}
        <section className="bg-gradient-to-r from-primary-600 via-primary-500 to-blue-400 py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of patients who trust Smart Hospital for their
              healthcare needs. Start your journey today.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold text-lg px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-xl"
            >
              Create Free Account
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary-500 text-white p-1.5 rounded-lg">
              <Activity size={20} />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              Smart<span className="text-primary-500">Hospital</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} Smart Hospital Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
