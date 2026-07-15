"use client";

import { useEffect, useState } from "react";
import { Wrench, MapPin, Phone, Settings2, CheckCircle2, User, CreditCard, Receipt, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Assignment = {
  id: number;
  service_date: string;
  status: string;
  complaint?: string | null;
  worker: { name: string; phone_number: string; id: number };
  customer: {
    name: string;
    phone_number: string;
    address: string;
    house_no?: string | null;
    building_name?: string | null;
    landmark?: string | null;
    pincode?: string | null;
    purifier_model_name: string;
  };
};

export default function WorkerAssignmentsPage() {
  const [activeTab, setActiveTab] = useState<"MY_TASKS" | "TEAM_TASKS">("MY_TASKS");
  const [dateFilter, setDateFilter] = useState<"TODAY" | "TOMORROW" | "LATER" | "ALL">("ALL");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [completingTask, setCompletingTask] = useState<Assignment | null>(null);
  const [serviceAmount, setServiceAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function getAssignments() {
    setLoading(true);
    try {
      const [myRes, teamRes] = await Promise.all([
        fetch("/api/worker-assignments"),
        fetch("/api/worker-assignments/all")
      ]);
      
      if (myRes.ok) setAssignments(await myRes.json());
      if (teamRes.ok) setTeamAssignments(await teamRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteTask(e: React.FormEvent) {
    e.preventDefault();
    if (!completingTask) return;

    setIsSubmitting(true);
    
    const res = await fetch(`/api/worker-assignments/${completingTask.id}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_amount: serviceAmount,
        payment_mode: paymentMode,
        invoice_number: invoiceNumber,
        remarks: remarks
      })
    });
    setIsSubmitting(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to complete task");
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCompletingTask(null);
      setServiceAmount("");
      setPaymentMode("CASH");
      setInvoiceNumber("");
      setRemarks("");
      getAssignments();
    }, 1500);
  }

  useEffect(() => {
    getAssignments();
  }, []);

  const getFilteredAssignments = (list: Assignment[]) => {
    return list.filter(assignment => {
      if (dateFilter === "ALL") return true;
      
      const assignmentDate = new Date(assignment.service_date);
      assignmentDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (dateFilter === "TODAY") {
        return assignmentDate.getTime() === today.getTime() || assignmentDate.getTime() < today.getTime(); // Include overdue in today
      } else if (dateFilter === "TOMORROW") {
        return assignmentDate.getTime() === tomorrow.getTime();
      } else if (dateFilter === "LATER") {
        return assignmentDate.getTime() > tomorrow.getTime();
      }
      return true;
    });
  };

  const displayedAssignments = getFilteredAssignments(assignments);
  const displayedTeamAssignments = getFilteredAssignments(teamAssignments);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 pl-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight mb-2">
            Task Dispatch
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">Pending service appointments for today.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-col md:items-end gap-3">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab("MY_TASKS")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "MY_TASKS" ? 'bg-white text-[#111111] shadow-sm' : 'text-gray-500 hover:text-[#111111]'}`}
            >
              My Tasks
            </button>
            <button 
              onClick={() => setActiveTab("TEAM_TASKS")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "TEAM_TASKS" ? 'bg-white text-[#111111] shadow-sm' : 'text-gray-500 hover:text-[#111111]'}`}
            >
              Team Schedule
            </button>
          </div>
          
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl w-fit shadow-sm overflow-x-auto">
            {["ALL", "TODAY", "TOMORROW", "LATER"].map(filter => (
              <button 
                key={filter}
                onClick={() => setDateFilter(filter as any)}
                className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${dateFilter === filter ? 'bg-[#111111] text-white shadow-sm' : 'text-gray-500 hover:text-[#111111] hover:bg-gray-50'}`}
              >
                {filter === "ALL" ? "All Time" : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === "MY_TASKS" ? (
        /* MY TASKS VIEW */
        displayedAssignments.length === 0 ? (
          <div className="premium-card p-12 flex flex-col items-center justify-center text-center">
             <div className="icon-btn w-20 h-20 mb-6 cursor-default border-gray-100">
               <CheckCircle2 className="w-10 h-10 text-gray-400" />
             </div>
             <p className="text-2xl font-extrabold text-[#111111] tracking-tight">No Tasks</p>
             <p className="mt-2 text-gray-500 font-medium">You have no pending assignments for this date filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedAssignments.map((assignment) => {
              const dateObj = new Date(assignment.service_date);
              const isSoon = (dateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 2;

              return (
                <div key={assignment.id} className="premium-card p-6 md:p-8 relative flex flex-col">
                  {isSoon && (
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-[#111111] rounded-t-[1.5rem]"></div>
                  )}

                  <div className="flex justify-between items-center mb-6 mt-1">
                    <span className="text-xs font-extrabold px-3 py-1 bg-gray-100 rounded-lg text-[#111111] border border-gray-200 uppercase tracking-widest">
                      {formatDate(dateObj)}
                    </span>
                    {isSoon && (
                      <span className="badge-urgent shadow-sm">
                        Urgent
                      </span>
                    )}
                  </div>
                  
                  <h2 className="font-extrabold text-2xl md:text-3xl text-[#111111] mb-4 tracking-tight leading-none">{assignment.customer.name}</h2>
                  
                  <div className="space-y-5 mt-auto mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-[#111111] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#111111] leading-relaxed font-semibold">
                        {[
                          assignment.customer.house_no, 
                          assignment.customer.building_name, 
                          assignment.customer.address, 
                          assignment.customer.landmark, 
                          assignment.customer.pincode
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Settings2 className="w-5 h-5 text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-500 font-bold tracking-wide uppercase">
                        {assignment.customer.purifier_model_name}
                      </p>
                    </div>
                  </div>

                  {assignment.complaint && (
                    <div className="mb-8 bg-red-50 p-4 rounded-2xl border border-red-100">
                      <p className="text-sm text-red-700 font-bold uppercase mb-1">Complaint / Issue:</p>
                      <p className="text-sm text-red-800 leading-relaxed font-medium">
                        {assignment.complaint}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <a href={`tel:${assignment.customer.phone_number}`} className="icon-btn w-full py-4 text-base font-bold flex gap-3 text-[#111111]">
                      <Phone className="w-5 h-5" />
                      {assignment.customer.phone_number}
                    </a>
                    
                    <button onClick={() => setCompletingTask(assignment)} className="tactile-btn w-full shadow-xl text-base h-[54px]">
                      Complete Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* TEAM TASKS VIEW */
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-5 font-bold text-xs text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-5 font-bold text-xs text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-5 font-bold text-xs text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-5 font-bold text-xs text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {displayedTeamAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-semibold text-[#111111] whitespace-nowrap">
                      {formatDate(a.service_date)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-blue-600">{a.worker.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-[#111111]">{a.customer.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{a.customer.purifier_model_name}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 max-w-xs truncate">
                      {[a.customer.house_no, a.customer.building_name, a.customer.address, a.customer.landmark, a.customer.pincode].filter(Boolean).join(", ")}
                    </td>
                  </tr>
                ))}
                {displayedTeamAssignments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No team assignments found for this date filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCompleteTask} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-2 text-[#111111]">Complete Task</h3>
            <p className="text-sm text-gray-500 mb-6">Finalize service for <span className="font-bold text-black">{completingTask.customer.name}</span>.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><DollarSign className="w-3 h-3"/> Service Amount</label>
                <input required type="number" step="0.01" value={serviceAmount} onChange={e => setServiceAmount(e.target.value)} className="input-minimal rounded-xl" placeholder="e.g. 1500" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><CreditCard className="w-3 h-3"/> Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="input-minimal rounded-xl text-gray-700 bg-white">
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="FREE_AMC">Free (Under AMC/Warranty)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><Receipt className="w-3 h-3"/> Invoice Number (Optional)</label>
                <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="input-minimal rounded-xl" placeholder="INV-2026-XXXX" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><Wrench className="w-3 h-3"/> Feedback / Service Details</label>
                <textarea required value={remarks} onChange={e => setRemarks(e.target.value)} className="input-minimal rounded-xl min-h-[100px] resize-y" placeholder="Type what you have done during the service (e.g. replaced parts, cleaned filters)..." />
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                type="button" 
                onClick={() => setCompletingTask(null)} 
                className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isSubmitting || isSuccess}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className={`flex-1 py-3 font-bold text-white bg-green-600 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSuccess ? '!bg-green-500 scale-100' : 'hover:bg-green-700 shadow-green-600/30'} ${isSubmitting ? 'opacity-80' : ''}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Completed!
                  </>
                ) : (
                  "Mark Completed"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
