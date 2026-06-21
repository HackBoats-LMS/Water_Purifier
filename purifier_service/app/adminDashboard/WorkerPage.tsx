"use client";

import { useEffect, useState } from "react";
import { Plus, UserCog, KeySquare, Search, CheckCircle2 } from "lucide-react";

type Worker = {
  id: number;
  name: string;
  phone_number: string;
  email: string | null;
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add Worker State
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [isAddSuccess, setIsAddSuccess] = useState(false);

  // Edit Worker State
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);

  // Password Reset State
  const [passwordWorker, setPasswordWorker] = useState<Worker | null>(null);
  const [newPassword, setNewPassword] = useState("");

  async function getWorkers() {
    try {
      const res = await fetch("/api/workers/list");
      if (!res.ok) throw new Error("Failed to fetch workers");
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addWorker(e: React.FormEvent) {
    e.preventDefault();
    setIsAddSubmitting(true);
    const res = await fetch("/api/workers/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone_number: phoneNumber, password }),
    });
    setIsAddSubmitting(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to add worker");
      return;
    }

    setIsAddSuccess(true);
    setTimeout(() => {
      setIsAddSuccess(false);
      setName("");
      setPhoneNumber("");
      setPassword("");
      getWorkers();
    }, 1500);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingWorker) return;

    setIsEditSubmitting(true);
    const res = await fetch(`/api/workers/${editingWorker.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, phone_number: editPhone, email: editEmail }),
    });
    setIsEditSubmitting(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to update worker");
      return;
    }

    setIsEditSuccess(true);
    setTimeout(() => {
      setIsEditSuccess(false);
      setEditingWorker(null);
      getWorkers();
    }, 1500);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordWorker) return;

    const res = await fetch(`/api/workers/${passwordWorker.id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: newPassword }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to update password");
      return;
    }

    alert("Password updated successfully!");
    setPasswordWorker(null);
    setNewPassword("");
  }

  useEffect(() => {
    getWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.phone_number.includes(searchQuery)
  );

  return (
    <div className="space-y-6 h-full pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pl-2">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Technicians Directory</h1>
          <p className="text-gray-500 font-medium mt-1">Manage field technicians and their accounts.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Left Col: Worker Table */}
      <div className="lg:col-span-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : workers.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <p className="text-xl font-bold text-[#111111]">No workers found</p>
              <p className="text-gray-500 mt-2">Add a new worker to see them listed here.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Top Controls */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search technicians by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-[#fbfbfb]">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 font-medium">
                        No technicians found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((w) => (
                      <tr key={w.id} className="hover:bg-white transition-colors duration-200 group">
                        <td className="px-6 py-4 text-sm text-[#111111] font-bold">
                          {w.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {w.phone_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {w.email ?? "-"}
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingWorker(w);
                              setEditName(w.name);
                              setEditPhone(w.phone_number);
                              setEditEmail(w.email || "");
                            }}
                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Details"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setPasswordWorker(w)}
                            className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Change Password"
                          >
                            <KeySquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Col: Add Worker Form */}
      <div>
        <form onSubmit={addWorker} className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] space-y-6 sticky top-6 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
               <Plus className="w-8 h-8 text-[#111111] font-bold" strokeWidth={3} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#111111] tracking-tight mb-2">Register Worker</h2>
          <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">Add a new field technician to the system.</p>

          <div className="space-y-4">
            <input required value={name} onChange={e => setName(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Full Name" />
            <input required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Phone Number" />
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Temporary Password" />
          </div>

          <button 
            type="submit" 
            disabled={isAddSubmitting || isAddSuccess}
            className={`tactile-btn w-full mt-6 shadow-2xl py-4 text-base flex justify-center items-center gap-2 transition-all ${isAddSuccess ? '!bg-green-500 !scale-100' : ''} ${isAddSubmitting ? 'opacity-80' : ''}`}
          >
            {isAddSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isAddSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Registered!
              </>
            ) : (
              "Register Worker"
            )}
          </button>
        </form>
      </div>

      {/* Modals */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-6 text-[#111111]">Edit Worker</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                <input required value={editName} onChange={e => setEditName(e.target.value)} className="input-minimal rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                <input required value={editPhone} onChange={e => setEditPhone(e.target.value)} className="input-minimal rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email (Optional)</label>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" className="input-minimal rounded-xl mt-1" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                type="button" 
                onClick={() => setEditingWorker(null)} 
                className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isEditSubmitting || isEditSuccess}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isEditSubmitting || isEditSuccess}
                className={`flex-1 py-3 font-bold text-white bg-[#111111] rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isEditSuccess ? '!bg-green-500' : 'hover:bg-black'} ${isEditSubmitting ? 'opacity-80' : ''}`}
              >
                {isEditSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isEditSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {passwordWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-6 text-[#111111]">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-6">Enter a new password for <span className="font-bold text-black">{passwordWorker.name}</span>.</p>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
              <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-minimal rounded-xl mt-1" />
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setPasswordWorker(null)} className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-3 font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/30 transition-transform active:scale-95">Update Password</button>
            </div>
          </form>
        </div>
      )}
    </div>
    </div>
  );
}