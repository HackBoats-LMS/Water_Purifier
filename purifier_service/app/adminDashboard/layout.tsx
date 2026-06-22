"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ClipboardList, Briefcase, Hexagon, LogOut, Receipt, Database } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    // Client-side fetch for session info to avoid SSR layout mismatch with next-auth redirect
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative z-10 p-0 md:p-4 gap-0 md:gap-6 max-w-[100vw] overflow-x-hidden">
      
      {/* Desktop Neumorphic Sidebar Panel */}
      <aside className="hidden md:flex w-24 neumorphic-panel flex-col items-center py-8 gap-10 shrink-0">
        
        {/* Brand Icon */}
        <div className="w-12 h-12 flex items-center justify-center">
          <Hexagon className="text-[#111111] w-8 h-8" strokeWidth={2.5} />
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-4 w-full px-4 flex-1 items-center">
          <Link
            href="/adminDashboard/customers"
            className={`w-14 h-14 flex items-center justify-center transition-all ${pathname === '/adminDashboard/customers' ? 'neumorphic-active-btn' : 'icon-btn text-gray-400 hover:text-[#111111]'}`}
            title="Customers"
          >
            <Users className="w-6 h-6" strokeWidth={2} />
          </Link>

          <Link
            href="/adminDashboard"
            className={`w-14 h-14 flex items-center justify-center transition-all ${pathname === '/adminDashboard' ? 'neumorphic-active-btn' : 'icon-btn text-gray-400 hover:text-[#111111]'}`}
            title="Workers"
          >
            <Briefcase className="w-6 h-6" strokeWidth={2} />
          </Link>
          
          <Link
            href="/adminDashboard/assignments"
            className={`w-14 h-14 flex items-center justify-center transition-all ${pathname === '/adminDashboard/assignments' ? 'neumorphic-active-btn' : 'icon-btn text-gray-400 hover:text-[#111111]'}`}
            title="Assignments"
          >
            <ClipboardList className="w-6 h-6" strokeWidth={2} />
          </Link>

          <Link
            href="/adminDashboard/sales"
            className={`w-14 h-14 flex items-center justify-center transition-all ${pathname === '/adminDashboard/sales' ? 'neumorphic-active-btn' : 'icon-btn text-gray-400 hover:text-[#111111]'}`}
            title="Sales / Service Details"
          >
            <Receipt className="w-6 h-6" strokeWidth={2} />
          </Link>

          <Link
            href="/adminDashboard/data"
            className={`w-14 h-14 flex items-center justify-center transition-all ${pathname === '/adminDashboard/data' ? 'neumorphic-active-btn' : 'icon-btn text-gray-400 hover:text-[#111111]'}`}
            title="Data Management"
          >
            <Database className="w-6 h-6" strokeWidth={2} />
          </Link>
        </nav>

        {/* Logout / Bottom Action */}
        <Link 
          href="/api/auth/signout" 
          className="w-14 h-14 flex items-center justify-center icon-btn text-gray-400 hover:text-red-600 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" strokeWidth={2} />
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-[calc(100vh-4.5rem)] md:h-[calc(100vh-2rem)] w-full px-2 md:px-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center py-4 px-2">
          <div className="flex items-center gap-2">
            <Hexagon className="text-[#111111] w-6 h-6" strokeWidth={2.5} />
            <span className="font-bold text-lg text-[#111111]">AquaSync</span>
          </div>
          <Link href="/api/auth/signout" className="text-gray-500 hover:text-red-600">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>

        {/* Page Content */}
        <div className="flex-1 mt-0 md:mt-5 overflow-y-auto pb-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[4.5rem] bg-[#ebf3fa] border-t border-white shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 z-50">
        <Link
          href="/adminDashboard/customers"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === '/adminDashboard/customers' ? 'bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-3px_-3px_7px_rgba(255,255,255,1)] text-[#111111]' : 'text-gray-400'}`}
        >
          <Users className="w-5 h-5" strokeWidth={2} />
        </Link>
        
        <Link
          href="/adminDashboard"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === '/adminDashboard' ? 'bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-3px_-3px_7px_rgba(255,255,255,1)] text-[#111111]' : 'text-gray-400'}`}
        >
          <Briefcase className="w-5 h-5" strokeWidth={2} />
        </Link>

        <Link
          href="/adminDashboard/assignments"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === '/adminDashboard/assignments' ? 'bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-3px_-3px_7px_rgba(255,255,255,1)] text-[#111111]' : 'text-gray-400'}`}
        >
          <ClipboardList className="w-5 h-5" strokeWidth={2} />
        </Link>

        <Link
          href="/adminDashboard/sales"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === '/adminDashboard/sales' ? 'bg-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-3px_-3px_7px_rgba(255,255,255,1)] text-[#111111]' : 'text-gray-400'}`}
        >
          <Receipt className="w-5 h-5" strokeWidth={2} />
        </Link>
      </nav>
    </div>
  );
}
