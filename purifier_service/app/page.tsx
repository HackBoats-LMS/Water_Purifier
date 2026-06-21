import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { Droplet, ArrowRight, ShieldCheck, Clock, Settings } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authConfig);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Premium Header */}
      <header className="w-full p-6 flex justify-between items-center relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Droplet className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-extrabold text-[#111111] tracking-tight">AquaSync ERP</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <div className="max-w-4xl w-full">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 text-blue-700 font-bold text-sm tracking-wide uppercase border border-blue-200/50 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" />
            Authorized Personnel Only
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-[#111111] mb-6 tracking-tight leading-[1.1]">
            Intelligent Service <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Management
            </span>
          </h1>
          
          <p className="text-gray-500 text-lg md:text-xl mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
            The next-generation ERP for water purifier servicing. Seamlessly manage annual maintenance contracts (AMC), dispatch technicians, and track warranties.
          </p>

          <div className="flex justify-center flex-col sm:flex-row gap-4 items-center mb-20">
            {session ? (
              <Link 
                href={session.user?.role === "ADMIN" ? "/adminDashboard/assignments" : "/workerDashboard"}
                className="bg-[#111111] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
              >
                Access Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
              >
                Sign In Securely
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* Feature Highlight Cards */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm">
               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                 <Clock className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-[#111111] mb-2">Automated AMC</h3>
               <p className="text-gray-500 font-medium text-sm">System auto-calculates service intervals and flags due customers.</p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-[#111111] mb-2">Warranty Tracking</h3>
               <p className="text-gray-500 font-medium text-sm">Easily track In-House warranties and expiry dates per customer.</p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm">
               <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                 <Settings className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-[#111111] mb-2">Smart Dispatch</h3>
               <p className="text-gray-500 font-medium text-sm">Prioritized routing for technicians based on service urgency.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-sm font-medium relative z-10">
        &copy; {new Date().getFullYear()} AquaSync ERP Systems.
      </footer>
    </div>
  );
}
