"use client";

import { useEffect, useState } from "react";
import { Users, Phone, Mail, Building2 } from "lucide-react";

type Worker = {
  id: number;
  name: string;
  phone_number: string;
  email: string | null;
};

export default function ColleaguesPage() {
  const [colleagues, setColleagues] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  async function getColleagues() {
    try {
      const res = await fetch("/api/workers/list");
      if (!res.ok) throw new Error("Failed to fetch colleagues");
      const data = await res.json();
      setColleagues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getColleagues();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-6 md:mb-8 pl-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight mb-2">
          Headquarters
        </h1>
        <p className="text-gray-500 font-medium text-sm md:text-base">Directory of field workers and technicians.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleagues.map((worker) => (
            <div key={worker.id} className="premium-card p-6 md:p-8 flex flex-col">
              
              <div className="flex items-center gap-5 mb-6">
                <div className="icon-btn w-16 h-16 shrink-0 cursor-default">
                   <Users className="w-7 h-7 text-[#111111]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-xl text-[#111111] tracking-tight">{worker.name}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Technician</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4 text-sm text-[#111111]">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-bold tracking-wide">{worker.phone_number}</span>
                </div>
                {worker.email && (
                  <div className="flex items-center gap-4 text-sm text-[#111111]">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-bold truncate">{worker.email}</span>
                  </div>
                )}
              </div>
              
              <a href={`tel:${worker.phone_number}`} className="tactile-btn w-full shadow-xl text-sm h-[48px]">
                Call Technician
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
