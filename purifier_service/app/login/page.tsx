"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Droplets, Phone, Lock, ArrowRight, Loader2, CheckCircle2, Waves } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        phone_number: phoneNumber,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid phone number or password");
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1b61a3] flex flex-col relative overflow-hidden font-sans">
      
      {/* Top Header */}
      <header className="w-full p-6 flex justify-between items-center relative z-30 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-white/20 transition-colors">
            <Waves className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">AquaSync</span>
        </Link>
      </header>

      {/* Main Content (Login Form) */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 relative z-20 mt-[-10vh]">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <div className="inline-flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-xl">
                <Droplets className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-xl mb-2">
              Welcome back
            </h2>
            <p className="text-blue-100 font-medium drop-shadow-md">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]">
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl text-sm flex items-center backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-white mb-2 drop-shadow-sm">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-blue-200" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading || isSuccess}
                    className="appearance-none block w-full pl-11 pr-3 py-3.5 bg-white/10 border border-white/20 rounded-xl shadow-inner placeholder-blue-200/50 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-white mb-2 drop-shadow-sm">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isSuccess}
                    className="appearance-none block w-full pl-11 pr-3 py-3.5 bg-white/10 border border-white/20 rounded-xl shadow-inner placeholder-blue-200/50 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50
                    ${
                      isSuccess
                        ? "bg-emerald-500 text-white hover:bg-emerald-400"
                        : "bg-white text-[#1b61a3] hover:bg-blue-50"
                    } 
                    ${(isLoading || isSuccess) ? "opacity-90 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"}
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Signing in...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="-ml-1 mr-2 h-5 w-5" />
                      Success!
                    </>
                  ) : (
                    <>
                      Sign In Securely
                      <ArrowRight className="ml-2 h-5 w-5 opacity-80" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Layered SVG Waves & Static Boat */}
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

    </div>
  );
}