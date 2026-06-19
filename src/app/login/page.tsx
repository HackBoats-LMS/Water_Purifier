"use client";

import { useRouter } from "next/navigation";
import userLogin from "./action";
import { useState } from "react";

const LoginPage = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await userLogin(formData);

        if(result?.error){
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AquaCare</h1>
                <p className="text-slate-400">Sign in to your admin dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        required 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Enter password" 
                        required 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </div>
    )
}

export default LoginPage;
