import type { ReactNode } from "react";
import Link from "next/link";
import AuthGaurd from "./AuthGaurd"; // Assuming you have an AuthGuard here
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white font-sans">
      <Toaster position="top-right" />

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-sky-400">AquaCare</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sky-600 text-white shadow-lg shadow-sky-500/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link href="/admin/jobs" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span className="font-medium">Jobs & Services</span>
          </Link>

          <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span className="font-medium">Customers</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-left">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/5 backdrop-blur-xl p-4 flex justify-between items-center border-b border-white/10 z-10">
          <h2 className="text-xl font-bold text-sky-400">AquaCare</h2>
          <button className="text-slate-300 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Suspense fallback={<div className="text-slate-400 animate-pulse">Loading dashboard...</div>}>
            <AuthGaurd>{children}</AuthGaurd>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
