"use client";

import { useEffect, useState } from "react";
import { ClipboardList, AlertCircle, Calendar, UserCheck, CheckCircle2, User, MapPin, XCircle } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  phone_number: string;
  address: string;
  purifier_model_name: string;
  last_service_date: string | null;
  nextServiceDate?: string;
};

type Worker = {
  id: number;
  name: string;
  phone_number: string;
};

type Assignment = {
  id: number;
  service_date: string;
  status: string;
  worker: { name: string; phone_number: string };
  customer: { name: string; address: string; purifier_model_name: string };
};

export default function AssignmentsPage() {
  const [dueCustomers, setDueCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);

  // Form states for assignment
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function fetchData() {
    const [custRes, allCustRes, workRes, assignRes] = await Promise.all([
      fetch("/api/assignments/due"),
      fetch("/api/customers"),
      fetch("/api/workers/list"),
      fetch("/api/assignments")
    ]);

    if (custRes.ok) setDueCustomers(await custRes.json());
    if (allCustRes.ok) setAllCustomers(await allCustRes.json());
    if (workRes.ok) setWorkers(await workRes.json());
    if (assignRes.ok) setAllAssignments(await assignRes.json());
  }

  async function assignWorker(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCustomer || !selectedWorker || !serviceDate) {
      alert("Please select a customer, a worker, and a date.");
      return;
    }

    setIsSubmitting(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: selectedCustomer,
        workerId: selectedWorker,
        service_date: serviceDate,
      }),
    });
    setIsSubmitting(false);

    if (!res.ok) {
      alert("Failed to create assignment");
      return;
    }

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);

    // Reset fields
    setSelectedCustomer("");
    setSelectedWorker("");
    setServiceDate("");
    
    // Refresh lists
    await fetchData();
  }

  async function cancelAssignment(id: number) {
    if (!confirm("Are you sure you want to cancel this service assignment?")) return;

    const res = await fetch(`/api/assignments/${id}/cancel`, {
      method: "PATCH"
    });

    if (!res.ok) {
      alert("Failed to cancel assignment");
      return;
    }

    await fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 h-full pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pl-2">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Service Dispatch</h1>
          <p className="text-gray-500 font-medium mt-1">Assign due customers to field technicians.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Due Customers List */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#111111] tracking-tight flex items-center gap-2 pl-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Action Required
          </h2>
          
          {dueCustomers.length === 0 ? (
            <div className="premium-card p-12 flex flex-col items-center justify-center text-center">
              <div className="icon-btn w-16 h-16 mb-4 cursor-default border-green-100">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xl font-bold text-[#111111]">All caught up!</p>
              <p className="text-gray-500 font-medium mt-2">No customers are currently due for service.</p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {dueCustomers.map(c => {
                const nextDate = c.nextServiceDate ? new Date(c.nextServiceDate) : new Date();
                const diffTime = nextDate.getTime() - new Date().getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;

                return (
                <div key={c.id} className="premium-card p-6 border-l-[6px] border-l-red-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-extrabold text-xl text-[#111111]">{c.name}</h3>
                      <p className="text-sm text-gray-500 font-semibold mt-1">{c.phone_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {isOverdue ? "Overdue" : `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  
                  <div className="mt-4 text-sm text-[#111111] font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{c.address}</p>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                     <span>Model: {c.purifier_model_name}</span>
                     <span>
                        Last: {c.last_service_date ? new Date(c.last_service_date).toLocaleDateString() : 'Never'}
                     </span>
                  </div>
                  <button 
                     type="button"
                     onClick={() => setSelectedCustomer(c.id.toString())}
                     className="mt-4 w-full py-2.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                     Select for Dispatch
                  </button>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Assignment Form & Current Assignments */}
        <div className="space-y-8">
          <form onSubmit={assignWorker} className="premium-card p-8 space-y-6">
            <div className="flex items-center gap-4 mb-2 border-b border-gray-100 pb-6">
              <div className="icon-btn w-10 h-10 shrink-0 shadow-sm">
                 <UserCheck className="w-5 h-5 text-[#111111]" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">Dispatch Ticket</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Create a new service assignment.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <select 
                  value={selectedCustomer} 
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="input-minimal text-gray-700"
                >
                  <option value="">-- Select Customer --</option>
                  {allCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <select 
                  value={selectedWorker} 
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="input-minimal text-gray-700"
                >
                  <option value="">-- Assign Technician --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input 
                  type="date" 
                  required 
                  value={serviceDate} 
                  onChange={e => setServiceDate(e.target.value)} 
                  className="input-minimal [color-scheme:light]" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className={`tactile-btn w-full mt-6 shadow-xl flex items-center justify-center gap-2 transition-all ${isSuccess ? '!bg-green-500 !scale-100' : ''} ${isSubmitting ? 'opacity-80' : ''}`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Created!
                </>
              ) : (
                "Create Assignment"
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Current Assignments List */}
      <div className="mt-8">
        <h2 className="text-lg font-extrabold text-[#111111] tracking-tight flex items-center gap-2 pl-2 mb-4">
          <ClipboardList className="w-5 h-5 text-[#111111]" />
          All Assignments
        </h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-5 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="px-5 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {allAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-[#111111] whitespace-nowrap">
                      {new Date(a.service_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-blue-600">{a.worker.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-[#111111]">{a.customer.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{a.customer.purifier_model_name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${a.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : a.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {a.status === "PENDING" && (
                        <button 
                          onClick={() => cancelAssignment(a.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Cancel Service"
                        >
                          <XCircle className="w-5 h-5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {allAssignments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500 font-medium">
                      No assignments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
