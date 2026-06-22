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
    <div className="flex min-h-screen relative z-10 p-4 gap-6">
      
      {/* Neumorphic Sidebar Panel */}
      <aside className="w-24 neumorphic-panel flex flex-col items-center py-8 gap-10 shrink-0">
        
        {/* Brand Icon (like the hexagon in the image) */}
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
      <main className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)]">
        
        {/* Top Header (Search Bar) */}
        

        {/* Page Content */}
        <div className="flex-1 mt-5 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
