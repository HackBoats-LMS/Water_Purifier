"use client";

import { useEffect, useState } from "react";
import { ClipboardList, AlertCircle, Calendar, UserCheck, CheckCircle2, User, MapPin, XCircle, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  complaint?: string | null;
  remarks?: string | null;
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
  const [complaint, setComplaint] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // New UI states
  const [activeTab, setActiveTab] = useState<"OVERDUE" | "THIS_WEEK" | "NEXT_WEEK" | "NEXT_MONTH">("OVERDUE");
  const [customerSearchInput, setCustomerSearchInput] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "CANCELLED">("ALL");

  // Filtering Logic for Tabs
  const today = new Date();
  const getDiffDays = (dateStr?: string) => {
    const nextDate = dateStr ? new Date(dateStr) : new Date();
    return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const overdueList = dueCustomers.filter(c => getDiffDays(c.nextServiceDate) < 0);
  const thisWeekList = dueCustomers.filter(c => {
    const d = getDiffDays(c.nextServiceDate);
    return d >= 0 && d <= 7;
  });
  const nextWeekList = dueCustomers.filter(c => {
    const d = getDiffDays(c.nextServiceDate);
    return d > 7 && d <= 14;
  });
  const nextMonthList = dueCustomers.filter(c => {
    const d = getDiffDays(c.nextServiceDate);
    return d > 14;
  });

  const activeCustomersList =
    activeTab === "OVERDUE" ? overdueList :
      activeTab === "THIS_WEEK" ? thisWeekList :
        activeTab === "NEXT_WEEK" ? nextWeekList : nextMonthList;


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
        complaint: complaint || undefined,
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
    setComplaint("");

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
          <div className="flex flex-col gap-3 mb-6">
            <h2 className="text-lg font-extrabold text-[#111111] tracking-tight flex items-center gap-2 pl-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Service Pipeline
            </h2>

            {/* TABS */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTab("OVERDUE")} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeTab === 'OVERDUE' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                Overdue ({overdueList.length})
              </button>
              <button onClick={() => setActiveTab("THIS_WEEK")} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeTab === 'THIS_WEEK' ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                This Week ({thisWeekList.length})
              </button>
              <button onClick={() => setActiveTab("NEXT_WEEK")} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeTab === 'NEXT_WEEK' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                Next Week ({nextWeekList.length})
              </button>
              <button onClick={() => setActiveTab("NEXT_MONTH")} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeTab === 'NEXT_MONTH' ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Later ({nextMonthList.length})
              </button>
            </div>
          </div>

          {activeCustomersList.length === 0 ? (
            <div className="premium-card p-12 flex flex-col items-center justify-center text-center">
              <div className="icon-btn w-16 h-16 mb-4 cursor-default border-green-100">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xl font-bold text-[#111111]">Clear queue!</p>
              <p className="text-gray-500 font-medium mt-2">No customers pending for this timeframe.</p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {activeCustomersList.map(c => {
                const diffDays = getDiffDays(c.nextServiceDate);
                const isOverdue = diffDays < 0;

                return (
                  <div key={c.id} className={`premium-card p-6 border-l-[6px] ${isOverdue ? 'border-l-red-600' : 'border-l-blue-500'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-extrabold text-xl text-[#111111]">{c.name}</h3>
                        <p className="text-sm text-gray-500 font-semibold mt-1">{c.phone_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
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
                        Last: {c.last_service_date ? formatDate(c.last_service_date) : 'Never'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c.id.toString());
                        setCustomerSearchInput(`${c.name} - ${c.phone_number}`);
                      }}
                      className="mt-4 w-full py-2.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      Select for Dispatch
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Assignment Form & Current Assignments */}
        <div className="space-y-8">
          <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">Create Ticket Dispatch</h1>
          
          <form onSubmit={assignWorker} className="premium-card p-8 space-y-6">

            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-2 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="icon-btn w-10 h-10 shrink-0 shadow-sm">
                  <UserCheck className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">Dispatch Ticket</h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">Create a new service assignment.</p>
                </div>
              </div>
              <div className="relative w-full xl:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter customers..."
                  value={customerSearchInput}
                  onChange={e => {
                    setCustomerSearchInput(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  className="input-minimal !pl-10 text-sm py-2 min-w-[200px]"
                />

                {showSearchDropdown && customerSearchInput && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {(() => {
                      const safeSearch = customerSearchInput.toLowerCase();
                      const matched = allCustomers.filter(c =>
                        (c.name || "").toLowerCase().includes(safeSearch) ||
                        (c.phone_number || "").includes(safeSearch)
                      );

                      if (matched.length === 0) {
                        return <div className="p-3 text-sm text-gray-500 text-center font-medium">No matches found</div>;
                      }

                      return matched.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex flex-col gap-0.5"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedCustomer(c.id.toString());
                            setCustomerSearchInput("");
                            setShowSearchDropdown(false);
                          }}
                        >
                          <span className="text-sm font-bold text-[#111111]">{c.name}</span>
                          <span className="text-xs text-gray-500 font-medium">{c.phone_number}</span>
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="input-minimal text-gray-700"
                  required
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

              <div className="relative">
                <textarea
                  value={complaint}
                  onChange={e => setComplaint(e.target.value)}
                  className="input-minimal rounded-xl border-gray-300 shadow-sm w-full min-h-[80px]"
                  placeholder="Complaint or issue (optional)"
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pr-2">
          <h2 className="text-lg font-extrabold text-[#111111] tracking-tight flex items-center gap-2 pl-2">
            <ClipboardList className="w-5 h-5 text-[#111111]" />
            All Assignments
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  statusFilter === status 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full whitespace-nowrap lg:whitespace-normal">
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
                {allAssignments
                  .filter(a => statusFilter === "ALL" || a.status === statusFilter)
                  .map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-[#111111] whitespace-nowrap">
                      {formatDate(a.service_date)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-blue-600">{a.worker.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-[#111111]">{a.customer.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 mb-1">{a.customer.purifier_model_name}</div>
                      {a.remarks && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 whitespace-pre-wrap max-w-[200px] lg:max-w-xs">
                          <span className="font-bold text-gray-700 block mb-0.5">Feedback / Notes:</span>
                          {a.remarks}
                        </div>
                      )}
                      {a.complaint && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 whitespace-pre-wrap max-w-[200px] lg:max-w-xs">
                          <span className="font-bold text-red-700 block mb-0.5">Complaint:</span>
                          {a.complaint}
                        </div>
                      )}
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
                {allAssignments.filter(a => statusFilter === "ALL" || a.status === statusFilter).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500 font-medium">
                      No assignments found for this filter.
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
