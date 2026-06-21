"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Edit2, X } from "lucide-react";

type Assignment = {
  id: number;
  invoice_number: string | null;
  service_date: string;
  payment_mode: string | null;
  service_amount: number | null;
  status: string;
  completed_at: string | null;
  worker: { name: string; phone_number: string };
  customer: { name: string; phone_number: string; address: string };
};

export default function SalesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PENDING" | "CANCELLED">("COMPLETED");

  // Options for New Sale
  const [customers, setCustomers] = useState<{id:number, name:string, phone_number:string}[]>([]);
  const [workers, setWorkers] = useState<{id:number, name:string}[]>([]);

  // New Sale Modal State
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState("");
  const [newWorkerId, setNewWorkerId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newInvoice, setNewInvoice] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPaymentMode, setNewPaymentMode] = useState("CASH");

  // View & Edit Modal State
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editInvoice, setEditInvoice] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editPaymentMode, setEditPaymentMode] = useState("");

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditInvoice(assignment.invoice_number || "");
    setEditDate(new Date(assignment.service_date).toISOString().split('T')[0]);
    setEditAmount(assignment.service_amount !== null ? assignment.service_amount.toString() : "");
    setEditPaymentMode(assignment.payment_mode || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    try {
      const res = await fetch(`/api/assignments/${editingAssignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: editInvoice || null,
          service_date: editDate,
          service_amount: editAmount ? parseFloat(editAmount) : null,
          payment_mode: editPaymentMode || null
        })
      });

      if (!res.ok) throw new Error("Failed to update assignment");

      setEditingAssignment(null);
      fetchAssignments();
    } catch (err) {
      alert("Error updating assignment");
      console.error(err);
    }
  };

  async function fetchOptions() {
    try {
      const [cRes, wRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/workers/list")
      ]);
      if(cRes.ok) setCustomers(await cRes.json());
      if(wRes.ok) setWorkers(await wRes.json());
    } catch(e) {
      console.error(e);
    }
  }

  async function fetchAssignments() {
    try {
      const res = await fetch("/api/assignments");
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssignments();
    fetchOptions();
  }, []);

  const handleNewSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: newCustomerId,
          workerId: newWorkerId,
          service_date: newDate,
          status: "COMPLETED",
          invoice_number: newInvoice || null,
          service_amount: newAmount ? parseFloat(newAmount) : null,
          payment_mode: newPaymentMode || "CASH"
        })
      });

      if (!res.ok) throw new Error("Failed to create sale entry");

      setShowNewSaleModal(false);
      setNewCustomerId(""); setNewWorkerId(""); setNewDate(""); setNewInvoice(""); setNewAmount(""); setNewPaymentMode("CASH");
      fetchAssignments();
    } catch(err) {
      alert("Error creating new sale entry");
      console.error(err);
    }
  };

  const filteredAssignments = assignments.filter((a) => a.status === activeTab);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight">Service Records</h1>
          <p className="text-gray-500 text-sm mt-1">View all completed and pending retail entries.</p>
        </div>
        <button 
          onClick={() => setShowNewSaleModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#86b83f] hover:bg-[#75a336] text-white font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(134,184,63,0.4)] transition-all active:scale-95"
        >
          New Sale Entry
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        
        {/* Controls Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          
          {/* Tabs */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-[1rem]">
            <button
              onClick={() => setActiveTab("COMPLETED")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "COMPLETED" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Completed entries
            </button>
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "PENDING" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Pending entries
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "PENDING" ? "bg-[#111111] text-white" : "bg-gray-200 text-gray-700"}`}>
                {assignments.filter((a) => a.status === "PENDING").length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("CANCELLED")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "CANCELLED" ? "bg-white text-[#111111] shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Cancelled entries
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-sm w-full ml-4 hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Entries..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-gray-400">
              <span>Alt+S</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap min-w-max border-collapse">
              <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inv. No</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inv. Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inv. Amt.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Added By</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-[#fbfbfb]">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500 font-medium">
                      No {activeTab.toLowerCase()} entries found.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a, index) => (
                    <tr
                      key={a.id}
                      className="hover:bg-white transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-gray-600">
                        {a.invoice_number || `PM-${new Date().getFullYear()}-${String(a.id).padStart(5, '0')}`}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        {new Date(a.service_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
                          a.payment_mode === 'CASH' ? 'bg-green-100 text-green-700' :
                          a.payment_mode === 'UPI' ? 'bg-purple-100 text-purple-700' :
                          a.payment_mode === 'CARD' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {a.payment_mode || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-[#111111]">
                        {a.customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        {a.customer.phone_number}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 max-w-[200px] truncate" title={a.customer.address}>
                        {a.customer.address}
                      </td>
                      <td className="px-6 py-4 text-base font-black text-[#111111]">
                        ₹{a.service_amount !== null ? a.service_amount.toFixed(2) : "0.00"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        {a.worker.name}
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2">
                        <button onClick={() => setViewingAssignment(a)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditClick(a)} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-500">
          <div>
            Showing {filteredAssignments.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50" disabled>
               &lt;
            </button>
            <button className="p-1 hover:bg-gray-200 rounded disabled:opacity-50" disabled>
               &gt;
            </button>
          </div>
        </div>

      </div>

      {/* View Modal */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setViewingAssignment(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-[#111111]">Service Details</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Customer Info</p>
                <p className="font-bold text-[#111111] text-lg">{viewingAssignment.customer.name}</p>
                <p className="text-gray-600">{viewingAssignment.customer.phone_number}</p>
                <p className="text-gray-600 text-sm mt-1">{viewingAssignment.customer.address}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Assignment Info</p>
                <p className="text-gray-700"><strong>Status:</strong> <span className="uppercase text-sm tracking-widest font-bold">{viewingAssignment.status}</span></p>
                <p className="text-gray-700"><strong>Assigned To:</strong> {viewingAssignment.worker.name}</p>
                <p className="text-gray-700"><strong>Scheduled Date:</strong> {new Date(viewingAssignment.service_date).toLocaleDateString()}</p>
                {viewingAssignment.completed_at && (
                  <p className="text-gray-700"><strong>Completed At:</strong> {new Date(viewingAssignment.completed_at).toLocaleString()}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Billing Info</p>
                <p className="text-gray-700"><strong>Invoice No:</strong> {viewingAssignment.invoice_number || "N/A"}</p>
                <p className="text-gray-700"><strong>Payment Mode:</strong> {viewingAssignment.payment_mode || "N/A"}</p>
                <p className="text-gray-700"><strong>Service Amount:</strong> {viewingAssignment.service_amount !== null ? `₹${viewingAssignment.service_amount}` : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setEditingAssignment(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-[#111111]">Edit Record</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Invoice Number</label>
                <input 
                  value={editInvoice} 
                  onChange={e => setEditInvoice(e.target.value)} 
                  className="input-minimal rounded-xl border-gray-300 shadow-sm" 
                  placeholder="e.g. INV-100" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Service Date</label>
                <input 
                  type="date"
                  required
                  value={editDate} 
                  onChange={e => setEditDate(e.target.value)} 
                  className="input-minimal rounded-xl border-gray-300 shadow-sm bg-white" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Service Amount (₹)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={editAmount} 
                  onChange={e => setEditAmount(e.target.value)} 
                  className="input-minimal rounded-xl border-gray-300 shadow-sm" 
                  placeholder="e.g. 450.00" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Payment Mode</label>
                <input 
                  value={editPaymentMode} 
                  onChange={e => setEditPaymentMode(e.target.value)} 
                  className="input-minimal rounded-xl border-gray-300 shadow-sm" 
                  placeholder="e.g. CASH, UPI" 
                />
              </div>

              <button type="submit" className="tactile-btn w-full mt-6 shadow-2xl py-4 text-base">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowNewSaleModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-[#111111]">New Sale Entry</h3>
            
            <form onSubmit={handleNewSaleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Customer</label>
                <select required value={newCustomerId} onChange={e => setNewCustomerId(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm bg-white">
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone_number}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Assigned By / Technician</label>
                <select required value={newWorkerId} onChange={e => setNewWorkerId(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm bg-white">
                  <option value="">Select Technician</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Invoice Number</label>
                <input 
                  value={newInvoice} 
                  onChange={e => setNewInvoice(e.target.value)} 
                  className="input-minimal rounded-xl border-gray-300 shadow-sm" 
                  placeholder="e.g. INV-100" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Service Date</label>
                <input 
                  type="date"
                  required
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)} 
                  className="input-minimal rounded-xl border-gray-300 shadow-sm bg-white" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Service Amount (₹)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={newAmount} 
                  onChange={e => setNewAmount(e.target.value)} 
                  className="input-minimal rounded-xl border-gray-300 shadow-sm" 
                  placeholder="e.g. 450.00" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Payment Mode</label>
                <select value={newPaymentMode} onChange={e => setNewPaymentMode(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm bg-white">
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="FREE_AMC">Free / AMC</option>
                </select>
              </div>

              <button type="submit" className="tactile-btn w-full mt-6 shadow-2xl py-4 text-base">
                Create Entry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
