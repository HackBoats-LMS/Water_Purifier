"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Users, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Worker");

  useEffect(() => {
    // Simple fetch to get session info for client component
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen flex-col md:flex-row pb-20 md:pb-0 relative z-10">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-72 bg-transparent p-6 flex-col gap-8 shrink-0">
        
        {/* Brand */}
        <div className="flex items-center gap-4 pl-2">
          <div className="icon-btn w-12 h-12 shrink-0">
            <Wrench className="text-[#111111] w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">AquaSync</h2>
            <p className="text-xs text-gray-500 font-semibold tracking-widest uppercase">Worker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 flex-1 mt-4">
          <Link
            href="/workerDashboard"
            className="flex items-center gap-4 px-3 py-2 rounded-xl group transition-all"
          >
            <div className={`icon-btn w-10 h-10 shrink-0 transition-all ${pathname === '/workerDashboard' ? 'text-[#111111] shadow-md border-gray-300 bg-gray-50' : 'text-gray-500 group-hover:text-[#111111] group-hover:shadow-md'}`}>
              <Wrench className="w-5 h-5" />
            </div>
            <span className={`font-semibold transition-colors ${pathname === '/workerDashboard' ? 'text-[#111111]' : 'text-gray-600 group-hover:text-[#111111]'}`}>Tasks</span>
          </Link>
          
          <Link
            href="/workerDashboard/colleagues"
            className="flex items-center gap-4 px-3 py-2 rounded-xl group transition-all"
          >
            <div className={`icon-btn w-10 h-10 shrink-0 transition-all ${pathname === '/workerDashboard/colleagues' ? 'text-[#111111] shadow-md border-gray-300 bg-gray-50' : 'text-gray-500 group-hover:text-[#111111] group-hover:shadow-md'}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className={`font-semibold transition-colors ${pathname === '/workerDashboard/colleagues' ? 'text-[#111111]' : 'text-gray-600 group-hover:text-[#111111]'}`}>Team</span>
          </Link>
        </nav>

        {/* User Profile */}
        <div className="pt-6">
           <div className="flex items-center gap-4 p-4 premium-card mb-4">
              <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                {userName[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#111111] truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">Technician</p>
              </div>
           </div>
           
           <Link href="/api/auth/signout" className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-sm font-bold text-gray-500 hover:text-[#111111] hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200">
             <LogOut className="w-4 h-4" />
             Sign Out
           </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 md:pl-0 overflow-y-auto w-full max-w-5xl mx-auto">
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200 flex justify-around items-center p-2 rounded-2xl z-50 shadow-2xl">
        <Link
          href="/workerDashboard"
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${pathname === '/workerDashboard' ? 'bg-[#111111] text-white shadow-inner' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Wrench className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wide">Tasks</span>
        </Link>

        <Link
          href="/workerDashboard/colleagues"
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${pathname === '/workerDashboard/colleagues' ? 'bg-[#111111] text-white shadow-inner' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wide">Team</span>
        </Link>

        <Link
          href="/api/auth/signout"
          className="flex flex-col items-center justify-center w-16 h-14 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wide">Logout</span>
        </Link>
      </nav>

    </div>
  );
}
