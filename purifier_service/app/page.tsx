import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { Droplet, ArrowRight, ShieldCheck, Clock, Settings, Waves, CheckCircle2, Navigation, Layers } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authConfig);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-screen bg-[#1b61a3] flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="w-full p-6 flex justify-between items-center relative z-30 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl flex items-center justify-center shadow-xl">
              <Waves className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">AquaSync</span>
          </div>
          
          {session && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-bold text-sm backdrop-blur-md border border-white/20">
               <ShieldCheck className="w-4 h-4 text-emerald-400" />
               Logged In
            </div>
          )}
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-20 mt-[-10vh]">
          <div className="max-w-4xl w-full">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1] drop-shadow-xl">
              Smooth Sailing for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">
                Service Management
              </span>
            </h1>
            
            <p className="text-blue-100 text-lg md:text-xl mb-10 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              The next-generation ERP for water purifier servicing. Seamlessly manage annual maintenance contracts, dispatch technicians, and track warranties effortlessly.
            </p>

            <div className="flex justify-center flex-col sm:flex-row gap-4 items-center">
              {session ? (
                <Link 
                  href={session.user?.role === "ADMIN" ? "/adminDashboard/assignments" : "/workerDashboard"}
                  className="bg-white text-[#1b61a3] px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group relative z-30"
                >
                  Access Portal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  href="/login"
                  className="bg-white text-[#1b61a3] hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group border border-white/50 relative z-30"
                >
                  Sign In Securely
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* Layered SVG Waves & Animated Boat */}
        <div className="absolute bottom-0 w-full leading-[0] z-0 pointer-events-none overflow-hidden">
          {/* Static Paper Boat */}
          <div className="absolute z-10 bottom-[30%] md:bottom-[40%] left-[15%] md:left-[20%] w-[80px] md:w-[120px]">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
              <g transform="translate(0, 10)">
                <line x1="50" y1="15" x2="50" y2="55" stroke="#cbd5e1" strokeWidth="1.5" />
                <polygon points="50,15 50,30 75,22.5" fill="#ef4444" />
                <polygon points="50,20 50,55 30,55" fill="#cbd5e1" />
                <polygon points="50,20 50,55 80,55" fill="#e2e8f0" />
                <polygon points="10,55 90,55 70,75 30,75" fill="#f8fafc" />
                <polygon points="30,75 50,55 70,75 50,85" fill="#e2e8f0" />
                <polygon points="10,55 50,55 30,75" fill="#f1f5f9" />
              </g>
            </svg>
          </div>

          <svg className="relative block w-[calc(100%+1.3px)] h-[150px] md:h-[280px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,45 C150,10 350,90 600,45 C850,0 1050,80 1200,45 L1200,120 L0,120 Z" fill="#bce4f7" className="animate-[pulse_10s_ease-in-out_infinite]" />
            <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z" fill="#75cbf0" className="animate-[pulse_8s_ease-in-out_infinite]" />
            <path d="M0,85 C250,120 450,40 600,85 C750,130 950,50 1200,85 L1200,120 L0,120 Z" fill="#42bdf5" />
          </svg>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative w-full py-24 bg-[#42bdf5] -mt-1 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mb-4">Core Capabilities</h2>
            <p className="text-cyan-50 max-w-2xl mx-auto font-medium text-lg">Everything you need to run your water purifier service business flawlessly.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-2xl shadow-blue-900/10 hover:-translate-y-2 transition-transform duration-300">
               <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                 <Clock className="w-7 h-7" strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-[#111111] mb-3">Automated AMC</h3>
               <p className="text-gray-500 font-medium leading-relaxed">System auto-calculates service intervals and flags due customers, ensuring no service window is ever missed.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-2xl shadow-blue-900/10 hover:-translate-y-2 transition-transform duration-300">
               <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                 <ShieldCheck className="w-7 h-7" strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-[#111111] mb-3">Warranty Tracking</h3>
               <p className="text-gray-500 font-medium leading-relaxed">Easily track In-House warranties and expiry dates per customer, preventing out-of-warranty free service claims.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-2xl shadow-blue-900/10 hover:-translate-y-2 transition-transform duration-300">
               <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                 <Settings className="w-7 h-7" strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-[#111111] mb-3">Smart Dispatch</h3>
               <p className="text-gray-500 font-medium leading-relaxed">Prioritized routing for technicians based on service urgency, customer location, and pending tickets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: WORKFLOW --- */}
      <section className="relative w-full py-24 bg-white z-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-black text-xl">1</div>
                <div>
                  <h4 className="text-xl font-bold text-[#111111] mb-2">Onboard Customers</h4>
                  <p className="text-gray-500 font-medium">Add new customers and specify their purifier model, purchase date, and interval preferences.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-black text-xl">2</div>
                <div>
                  <h4 className="text-xl font-bold text-[#111111] mb-2">Automatic Reminders</h4>
                  <p className="text-gray-500 font-medium">The system automatically flags users as "Action Required" when they are within 7 days of their next service.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-black text-xl">3</div>
                <div>
                  <h4 className="text-xl font-bold text-[#111111] mb-2">Dispatch & Track</h4>
                  <p className="text-gray-500 font-medium">Assign field workers to tickets. Technicians can mark tickets as complete on-site, instantly updating your dashboard.</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-inner relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-2xl opacity-40"></div>
                
                <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <h3 className="text-lg font-black text-[#111111] border-b border-gray-100 pb-4 mb-4">Streamlined Process</h3>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-50 rounded-xl flex items-center px-4 gap-3 border border-gray-100">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div className="h-2 w-32 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-12 bg-gray-50 rounded-xl flex items-center px-4 gap-3 border border-gray-100">
                      <Navigation className="w-5 h-5 text-blue-500" />
                      <div className="h-2 w-48 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-12 bg-gray-50 rounded-xl flex items-center px-4 gap-3 border border-gray-100">
                      <Layers className="w-5 h-5 text-purple-500" />
                      <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 text-sm font-medium py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplet className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-white text-lg tracking-wide">AquaSync ERP</span>
          </div>
          <p>&copy; {new Date().getFullYear()} All rights reserved. Transforming water purifier service management.</p>
        </div>
      </footer>

    </div>
  );
}
