import { createClient } from "@/lib/supabase/server";

const AdminDashboardPage = async () => {
    const supabase = await createClient();
    const { count: totalCostumers } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer");

    const today = new Date().toISOString().split('T')[0];
    const { count: servicesToday } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("scheduled_date", today);

    const { count: pendingAssignments } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "pending");

    const { data: upcomingServices } = await supabase.from("jobs").select(
        `
        id,
        job_type,
        scheduled_date,
        status,
        profiles!customer_id(full_name)
        `
    ).order("scheduled_date", { ascending: true }).limit(10);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome back, Administrator!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                    <p className="text-sm font-medium text-slate-400 mb-2">Total Customers</p>
                    <h2 className="text-3xl font-bold text-white">{totalCostumers || 0}</h2>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                    <p className="text-sm font-medium text-slate-400 mb-2">Services Today</p>
                    <h2 className="text-3xl font-bold text-white">{servicesToday || 0}</h2>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 relative overflow-hidden">
                    <p className="text-sm font-medium text-slate-400 mb-2">Pending Assignments</p>
                    <h2 className="text-3xl font-bold text-white">{pendingAssignments || 0}</h2>
                </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-semibold text-white">Upcoming Services (Next 48 hrs)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-sm font-medium text-slate-400">
                                <th className="px-6 py-4">Service ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                            {upcomingServices && upcomingServices.length > 0 ? (
                                upcomingServices.map((services) => (
                                    <tr key={services.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            {String(services.id).substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">{(services.profiles as any)?.full_name || "Unknown"}</td>
                                        <td className="px-6 py-4">{services.job_type || "standard"}</td>
                                        <td className="px-6 py-4">{new Date(services.scheduled_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                services.status === 'pending' 
                                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            }`}>
                                                {services.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No Upcoming Services found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardPage;