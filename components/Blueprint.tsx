import React from 'react';
import { 
  FileText, Layout, Users, Zap, Shield, Database, Smartphone, 
  ArrowRight, Sprout, Store, ShoppingCart, Lock, Cpu, Globe 
} from 'lucide-react';

export const Blueprint: React.FC = () => {
  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm">
              <FileText size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">System Documentation</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Platform <span className="text-emerald-500">Zero</span> Blueprint
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            A comprehensive technical and operational breakdown of the B2B fresh produce marketplace architecture.
          </p>
        </div>
      </div>

      {/* CORE SUMMARY BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#0F172A] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12 translate-x-1/4 -translate-y-1/4">
            <Globe size={300} />
          </div>
          <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
            <Layout className="text-emerald-400" /> Executive Summary
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-2xl">
            Platform Zero is a multi-sided marketplace designed to eliminate inefficiencies in the Australian produce supply chain. By connecting producers, aggregators, and buyers through a high-fidelity digital infrastructure, we reduce food waste, optimize logistics, and ensure price transparency.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest block mb-2">Frontend Stack</span>
              <p className="font-bold">React 18 + TypeScript + Tailwind CSS</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest block mb-2">Intelligence Engine</span>
              <p className="font-bold">Google Gemini 2.5 Flash / Pro</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-[2.5rem] p-10 border-2 border-emerald-100 flex flex-col justify-between shadow-sm group">
          <div>
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Real-time Persistence</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              Utilizes a stateful <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">localStorage</code> mock service, enabling full ACID-like data integrity during demonstrations without requiring a heavy backend.
            </p>
          </div>
          <div className="pt-6 border-t border-emerald-200 mt-6 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">MockDataService.ts</span>
            <Database size={18} className="text-emerald-300" />
          </div>
        </div>
      </div>

      {/* USER ECOSYSTEMS */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
          <Users className="text-indigo-600" /> User Ecosystems
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              role: 'Producer', 
              icon: Sprout, 
              color: 'emerald', 
              desc: 'Farmers move perishable stock at best prices via Field Logging and AI Scanning.' 
            },
            { 
              role: 'Aggregator', 
              icon: Store, 
              color: 'blue', 
              desc: 'Wholesalers manage fulfillment, drivers, and packers with B2B Deep Linking.' 
            },
            { 
              role: 'Buyer', 
              icon: ShoppingCart, 
              color: 'indigo', 
              desc: 'Restaurants get savings via AI Invoice comparison and Impact Reporting.' 
            },
            { 
              role: 'Operator', 
              icon: Lock, 
              color: 'slate', 
              desc: 'Platform admins control network health, markups, and lead capture logic.' 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${item.color}-100 text-${item.color}-600`}>
                <item.icon size={24} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{item.role}</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WORKFLOWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <Cpu size={240} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Automation</span>
              <h3 className="text-2xl font-black tracking-tight uppercase">Gemini Intelligence</h3>
            </div>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs">1</div>
                <div>
                  <p className="font-bold mb-1">Unstructured OCR</p>
                  <p className="text-sm text-indigo-100/70">Extracts line items from messy competitor invoices into structured objects.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs">2</div>
                <div>
                  <p className="font-bold mb-1">Seasonal Discovery</p>
                  <p className="text-sm text-indigo-100/70">Uses LLM reasoning to identify Australian seasonal produce for catalog updates.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs">3</div>
                <div>
                  <p className="font-bold mb-1">Arbitrage Mapping</p>
                  <p className="text-sm text-indigo-100/70">Calculates exact savings based on dynamic market benchmarks and segment logic.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile First</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Native SMS Strategy</h3>
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-gray-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                <Smartphone size={32} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Browser-as-a-Remote</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Platform Zero bypasses the friction of email by utilizing OS-specific protocol handlers to trigger the native device messaging apps.</p>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 font-mono text-[11px] text-slate-400">
              {'window.location.href = `sms:${phone}${sep}body=${msg}`;'}
            </div>
            <div className="flex items-center gap-4 text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
              Deep Linking <ArrowRight size={14} /> SMS Blast <ArrowRight size={14} /> Frictionless Trade
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 shrink-0">
          <Shield size={40} />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Fulfillment Audit Trail</h3>
          <p className="text-slate-600 font-medium leading-relaxed">
            Every transaction is backed by physical evidence: Photo-based packing verification, real-time driver tracking, and an immutable Proof of Delivery (PoD) photo that triggers the buyer's 60-minute quality window.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-center">Verified PoD</div>
          <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-center">GPS Timestamp</div>
          <div className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-center">Quality Window</div>
          <div className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-center">ACID Safety</div>
        </div>
      </div>
    </div>
  );
};