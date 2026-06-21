"use client";

import { useEffect, useState } from "react";
import { Plus, CheckSquare, Square, History, X, Edit2, Search } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  phone_number: string;
  address: string;
  purifier_model_name: string;
  customer_type: string;
  service_interval_months: number;
  email: string | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
  warranty_duration_months: number | null;
  last_service_date: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // History State
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [modelName, setModelName] = useState("");
  const [email, setEmail] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyDuration, setWarrantyDuration] = useState("");
  const [customerType, setCustomerType] = useState("IN_HOUSE");
  
  // Service Interval State
  const [intervalType, setIntervalType] = useState<"3" | "6" | "CUSTOM">("3");
  const [customInterval, setCustomInterval] = useState("1");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function getCustomers() {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    
    let finalInterval = intervalType === "CUSTOM" ? customInterval : intervalType;
    if (!finalInterval || isNaN(parseInt(finalInterval))) finalInterval = "3";

    const body: any = {
      name,
      phone_number: phone,
      email: email || undefined,
      address,
      purifier_model_name: modelName,
      customer_type: customerType,
      service_interval_months: finalInterval,
      last_service_date: new Date().toISOString(),
      purchase_date: purchaseDate || undefined,
      warranty_duration_months: warrantyDuration || undefined,
    };

    setIsSubmitting(true);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIsSubmitting(false);

    if (!res.ok) {
      const errorData = await res.json();
      alert(`Failed to add customer: ${errorData.error}`);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setName(""); setPhone(""); setEmail(""); setAddress(""); setModelName(""); setPurchaseDate(""); setWarrantyDuration(""); setCustomerType("IN_HOUSE"); setIntervalType("3"); setCustomInterval("1");
      setShowAddModal(false);
      getCustomers();
    }, 1500);
  }

  const handleEditClick = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone_number);
    setEmail(c.email || "");
    setAddress(c.address);
    setModelName(c.purifier_model_name);
    setCustomerType(c.customer_type);
    setPurchaseDate(c.purchase_date ? new Date(c.purchase_date).toISOString().split('T')[0] : "");
    setWarrantyDuration(c.warranty_duration_months ? c.warranty_duration_months.toString() : "");
    
    if (c.service_interval_months === 3) {
      setIntervalType("3");
    } else if (c.service_interval_months === 6) {
      setIntervalType("6");
    } else {
      setIntervalType("CUSTOM");
      setCustomInterval(c.service_interval_months.toString());
    }
  };

  async function updateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCustomer) return;
    
    let finalInterval = intervalType === "CUSTOM" ? customInterval : intervalType;
    if (!finalInterval || isNaN(parseInt(finalInterval))) finalInterval = "3";

    const body: any = {
      name,
      phone_number: phone,
      email: email || undefined,
      address,
      purifier_model_name: modelName,
      customer_type: customerType,
      service_interval_months: finalInterval,
      purchase_date: purchaseDate || undefined,
      warranty_duration_months: warrantyDuration || undefined,
    };

    setIsSubmitting(true);
    const res = await fetch(`/api/customers/${editingCustomer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIsSubmitting(false);

    if (!res.ok) {
      const errorData = await res.json();
      alert(`Failed to update customer: ${errorData.error}`);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setName(""); setPhone(""); setEmail(""); setAddress(""); setModelName(""); setPurchaseDate(""); setWarrantyDuration(""); setCustomerType("IN_HOUSE"); setIntervalType("3"); setCustomInterval("1");
      setEditingCustomer(null);
      getCustomers();
    }, 1500);
  }

  async function fetchHistory(customer: Customer) {
    setHistoryCustomer(customer);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/history`);
      if (res.ok) {
        setHistoryData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    getCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone_number.includes(searchQuery) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full pb-10 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-[#111111] tracking-tight">Customers Directory</h1>
        <button 
          onClick={() => {
            // Reset Form for Add
            setName(""); setPhone(""); setEmail(""); setAddress(""); setModelName(""); setPurchaseDate(""); setWarrantyDuration(""); setCustomerType("IN_HOUSE"); setIntervalType("3"); setCustomInterval("1");
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#86b83f] hover:bg-[#75a336] text-white font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(134,184,63,0.4)] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          Add Customer
        </button>
      </div>

      {/* Full Width Table */}
      <div className="w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : customers.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <p className="text-xl font-bold text-[#111111]">No records found</p>
              <p className="text-gray-500 mt-2">Add a new customer to see them listed here.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Top Controls */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers by name, phone, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto w-full">
              <table className="w-full text-left whitespace-nowrap min-w-max border-collapse">
                <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-20">
                       <div className="w-8 h-8 rounded-xl border border-gray-300 flex items-center justify-center">
                         <div className="w-4 h-1 bg-gray-400 rounded-full"></div>
                       </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Model</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Purchase Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Warranty Expiry</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Service</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-[#fbfbfb]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500 font-medium">
                        No customers found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => {
                      const isActive = activeRowId === c.id;
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => setActiveRowId(c.id)}
                        className={`cursor-pointer transition-all duration-200 group ${
                          isActive 
                            ? 'bg-white shadow-[0_10px_20px_rgba(0,0,0,0.08)] relative z-10 scale-[1.01] -my-1 rounded-lg border-y border-gray-100' 
                            : 'hover:bg-white'
                        }`}
                      >
                        <td className="px-6 py-4">
                          {isActive ? (
                            <div className="w-8 h-8 rounded-xl bg-white shadow-md border border-gray-200 flex items-center justify-center">
                              <CheckSquare className="w-5 h-5 text-[#111111]" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl border border-gray-300 flex items-center justify-center bg-white">
                              <Square className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
                            </div>
                          )}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isActive ? 'font-bold text-[#111111]' : 'font-bold text-[#111111]'}`}>
                          {c.name}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isActive ? 'font-bold text-[#111111]' : 'text-gray-600'}`}>
                          {c.purifier_model_name}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isActive ? 'font-bold text-[#111111]' : 'text-gray-500 font-medium'}`}>
                          {c.phone_number}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isActive ? 'font-bold text-[#111111]' : 'text-gray-500 font-medium'}`}>
                          <div className="max-w-[200px] truncate" title={c.address}>{c.address}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
                            c.customer_type === "IN_HOUSE" ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {c.customer_type === "IN_HOUSE" ? "In-House" : "External"}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isActive ? 'font-bold text-[#111111]' : 'text-gray-500 font-medium'}`}>
                          {c.purchase_date ? new Date(c.purchase_date).toLocaleDateString() : "-"}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isActive ? 'font-bold text-[#111111]' : 'text-gray-500 font-medium'}`}>
                          {c.warranty_expiry_date ? (
                            <span className="text-blue-600 font-bold">{new Date(c.warranty_expiry_date).toLocaleDateString()}</span>
                          ) : "-"}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isActive ? 'font-bold text-[#111111]' : 'text-gray-500 font-medium'}`}>
                          {(() => {
                             if (!c.last_service_date) return "-";
                             const nextDate = new Date(c.last_service_date);
                             nextDate.setMonth(nextDate.getMonth() + c.service_interval_months);
                             const isOverdue = nextDate.getTime() < new Date().getTime();
                             return (
                               <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                 {nextDate.toLocaleDateString()}
                               </span>
                             );
                          })()}
                        </td>
                        <td className="px-6 py-4 flex items-center justify-center gap-2">
                          <button 
                            onClick={(e) => handleEditClick(c, e)}
                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); fetchHistory(c); }}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="View Service History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              type="button" 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={addCustomer} className="space-y-6">
              
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
                   <Plus className="w-8 h-8 text-[#86b83f] font-bold" strokeWidth={3} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#111111] tracking-tight text-center mb-1">Add New Record</h2>
              <p className="text-sm text-gray-500 font-medium text-center mb-6 leading-relaxed">Fill out the details below to add a new customer.</p>

              <div className="space-y-4">
            <div>
              <input required value={name} onChange={e => setName(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Full Name" />
            </div>
            
            <div>
              <input required value={phone} onChange={e => setPhone(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Contact Number" />
            </div>

            <div>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Email Address (Optional)" />
            </div>

            <div>
              <input required value={address} onChange={e => setAddress(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Address" />
            </div>

            <div>
              <select value={customerType} onChange={e => setCustomerType(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm text-gray-700 appearance-none bg-white">
                <option value="IN_HOUSE">In-House</option>
                <option value="External">External</option>
              </select>
            </div>

            <div>
              <input required value={modelName} onChange={e => setModelName(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Purifier Model" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-bold uppercase block">Service Interval</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIntervalType("3")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${intervalType === "3" ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  3 Months
                </button>
                <button type="button" onClick={() => setIntervalType("6")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${intervalType === "6" ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  6 Months
                </button>
                <button type="button" onClick={() => setIntervalType("CUSTOM")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${intervalType === "CUSTOM" ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  Custom
                </button>
              </div>
              {intervalType === "CUSTOM" && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" required min="1" max="60" value={customInterval} onChange={e => setCustomInterval(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm w-full" placeholder="Number of months" />
                  <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Months</span>
                </div>
              )}
            </div>

            {customerType === "IN_HOUSE" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-800">Warranty Details</h3>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Purchase Date</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="input-minimal rounded-xl border-blue-200 shadow-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Warranty Duration</label>
                  <select value={warrantyDuration} onChange={e => setWarrantyDuration(e.target.value)} className="input-minimal rounded-xl border-blue-200 shadow-sm text-gray-700 appearance-none bg-white">
                    <option value="">No Warranty</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">1 Year</option>
                    <option value="24">2 Years</option>
                    <option value="36">3 Years</option>
                    <option value="48">4 Years</option>
                    <option value="60">5 Years</option>
                  </select>
                </div>
              </div>
            )}
          </div>

              <button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className={`tactile-btn w-full mt-6 shadow-2xl py-4 text-base flex justify-center items-center gap-2 transition-all ${isSuccess ? '!bg-green-500 !scale-100' : ''} ${isSubmitting ? 'opacity-80' : ''}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isSuccess ? (
                  <>
                    <CheckSquare className="w-5 h-5" />
                    Added!
                  </>
                ) : (
                  "Add New Record"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              type="button" 
              onClick={() => setEditingCustomer(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={updateCustomer} className="space-y-6">
              
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
                   <Edit2 className="w-8 h-8 text-blue-600 font-bold" strokeWidth={3} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#111111] tracking-tight text-center mb-1">Edit Customer Record</h2>
              <p className="text-sm text-gray-500 font-medium text-center mb-6 leading-relaxed">Update the customer details below.</p>

              <div className="space-y-4">
                <div>
                  <input required value={name} onChange={e => setName(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Full Name" />
                </div>
                
                <div>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Contact Number" />
                </div>

                <div>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Email Address (Optional)" />
                </div>

                <div>
                  <input required value={address} onChange={e => setAddress(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Address" />
                </div>

                <div>
                  <select value={customerType} onChange={e => setCustomerType(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm text-gray-700 appearance-none bg-white">
                    <option value="IN_HOUSE">In-House</option>
                    <option value="External">External</option>
                  </select>
                </div>

                <div>
                  <input required value={modelName} onChange={e => setModelName(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm" placeholder="Purifier Model" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-bold uppercase block">Service Interval</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIntervalType("3")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${intervalType === "3" ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      3 Months
                    </button>
                    <button type="button" onClick={() => setIntervalType("6")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${intervalType === "6" ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      6 Months
                    </button>
                    <button type="button" onClick={() => setIntervalType("CUSTOM")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${intervalType === "CUSTOM" ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      Custom
                    </button>
                  </div>
                  {intervalType === "CUSTOM" && (
                    <div className="flex items-center gap-2 mt-2">
                      <input type="number" required min="1" max="60" value={customInterval} onChange={e => setCustomInterval(e.target.value)} className="input-minimal rounded-xl border-gray-300 shadow-sm w-full" placeholder="Number of months" />
                      <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Months</span>
                    </div>
                  )}
                </div>

                {customerType === "IN_HOUSE" && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800">Warranty Details</h3>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Purchase Date</label>
                      <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="input-minimal rounded-xl border-blue-200 shadow-sm bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Warranty Duration</label>
                      <select value={warrantyDuration} onChange={e => setWarrantyDuration(e.target.value)} className="input-minimal rounded-xl border-blue-200 shadow-sm text-gray-700 appearance-none bg-white">
                        <option value="">No Warranty</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                        <option value="24">2 Years</option>
                        <option value="36">3 Years</option>
                        <option value="48">4 Years</option>
                        <option value="60">5 Years</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className={`tactile-btn w-full mt-6 shadow-2xl py-4 text-base flex justify-center items-center gap-2 transition-all ${isSuccess ? '!bg-green-500 !scale-100' : ''} ${isSubmitting ? 'opacity-80' : ''}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isSuccess ? (
                  <>
                    <CheckSquare className="w-5 h-5" />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col">
            <button 
              onClick={() => setHistoryCustomer(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold mb-2 text-[#111111]">Service History</h3>
            <p className="text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
              Tracking timeline for <span className="font-bold text-black">{historyCustomer.name}</span> ({historyCustomer.phone_number})
            </p>

            <div className="flex-1 overflow-y-auto pr-2">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-medium">
                  No service records found for this customer.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyData.map((task) => (
                    <div key={task.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          task.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {task.status}
                        </span>
                        <span className="text-sm font-bold text-gray-500">
                          {new Date(task.service_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <p className="text-sm font-bold text-[#111111]">Technician: {task.worker?.name || "Unknown"}</p>
                          {task.completed_at && (
                            <p className="text-xs text-gray-500 mt-1">Completed on {new Date(task.completed_at).toLocaleDateString()}</p>
                          )}
                        </div>
                        {task.service_amount !== null && (
                          <div className="text-right">
                            <p className="text-lg font-black text-[#111111]">₹{task.service_amount}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">{task.payment_mode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
