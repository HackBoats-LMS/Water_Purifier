"use client";

import { useState } from "react";
import { DownloadCloud, Trash2, DatabaseZap, AlertTriangle } from "lucide-react";

export default function DataManagementPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    
    // Direct browser navigation to trigger the CSV download
    window.open(`/api/data-management?start=${startDate}&end=${endDate}`, "_blank");
  };

  const handleDelete = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const confirmDelete = confirm(
      `WARNING: Are you absolutely sure you want to permanently delete all retail service records between ${startDate} and ${endDate}? \n\nThis cannot be undone. Please ensure you have exported the data first.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/data-management?start=${startDate}&end=${endDate}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete records");
      }
      
      setMessage(`Success: ${data.message}`);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMockData = async () => {
    const confirmGenerate = confirm("This will wipe existing demo data and generate fresh mock customers and assignments. Continue?");
    if(!confirmGenerate) return;

    setLoading(true);
    setMessage("Generating mock data, please wait...");
    
    try {
      const res = await fetch("/api/mock", { method: "POST" });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || "Failed to generate mock data");
      
      setMessage("Mock data generated successfully! You can view it in the other tabs.");
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteMockData = async () => {
    const confirmDelete = confirm("WARNING: This will permanently delete ALL customers, workers, and service records from the database. Do you want to proceed?");
    if (!confirmDelete) return;

    setLoading(true);
    setMessage("Deleting all data, please wait...");

    try {
      const res = await fetch("/api/mock", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete data");

      setMessage("All database records have been wiped clean.");
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 h-full pb-10 max-w-4xl mx-auto space-y-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Data Management</h1>
        <p className="text-gray-500 font-medium mt-1">Export, clear, or mock database records.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl font-bold ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Date Range Tool */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-200 shadow-sm relative overflow-hidden">
        
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
             <DatabaseZap className="w-5 h-5" />
           </div>
           <h2 className="text-xl font-extrabold text-[#111111]">Bulk Data Operations</h2>
        </div>

        <p className="text-sm text-gray-500 mb-6 font-medium">Select a date range to export or delete Service Assignments (Retail Sales entries). It is highly recommended to export data to Excel before deleting.</p>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="input-minimal rounded-xl w-full" 
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="input-minimal rounded-xl w-full" 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="flex-1 py-4 bg-[#111111] hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <DownloadCloud className="w-5 h-5" />
            Export to Excel (CSV)
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl border border-red-200 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            Delete Records
          </button>
        </div>
        
      </div>

      {/* Mock Data Section */}
      <div className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
             <AlertTriangle className="w-5 h-5" />
           </div>
           <h2 className="text-xl font-extrabold text-[#111111]">Development Tools</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6 font-medium">Use this tool to inject dummy workers, customers, and assignments to test UI functionality. <br/><strong>Warning:</strong> This will delete existing demo data.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button 
            onClick={handleMockData}
            disabled={loading}
            className="flex-1 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-transform active:scale-95 disabled:opacity-50"
          >
            Generate Mock Data
          </button>
          
          <button 
            onClick={handleDeleteMockData}
            disabled={loading}
            className="flex-1 px-8 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-transform active:scale-95 disabled:opacity-50 border border-red-200"
          >
            Delete All Mock Data
          </button>
        </div>
      </div>

    </div>
  );
}
