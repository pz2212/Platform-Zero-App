import React, { useState, useEffect } from 'react';
import { 
  Gift, Users, Tag, Calendar, Megaphone, Plus, Trash2, 
  ToggleLeft, ToggleRight, LayoutDashboard, Settings, DollarSign,
  Store, TrendingDown, Target, Save, Info, Calculator, Sparkles, ArrowRight
} from 'lucide-react';
import { mockService, SegmentConfig } from '../services/mockDataService';
import { BusinessCategory } from '../types';

interface PromoCode {
  id: string;
  code: string;
  discountDisplay: string;
  redemptions: number;
  status: 'Active' | 'Paused';
  type: 'percent' | 'fixed';
  value: number;
}

export const CustomerPortals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'credits'>('growth');

  // --- NEW USER BONUS STATE ---
  const [bonusEnabled, setBonusEnabled] = useState(true);
  const [bonusAmount, setBonusAmount] = useState(15);
  const [bonusStart, setBonusStart] = useState('2023-12-01');
  const [bonusEnd, setBonusEnd] = useState('2024-01-31');

  // --- REFERRAL PROGRAM STATE ---
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referrerAmount, setReferrerAmount] = useState(10);
  const [refereeAmount, setRefereeAmount] = useState(10);

  // --- MARKET SEGMENT SAVINGS STATE ---
  const [segmentConfigs, setSegmentConfigs] = useState<Record<BusinessCategory, SegmentConfig>>(mockService.getMarketSegmentConfigs());
  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

  // --- PROMO CODES STATE ---
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: '1', code: 'WELCOME50', discountDisplay: '50% OFF', redemptions: 124, status: 'Active', type: 'percent', value: 50 },
    { id: '2', code: 'FREELUNCH', discountDisplay: '$15 CREDIT', redemptions: 45, status: 'Paused', type: 'fixed', value: 15 },
    { id: '3', code: 'SUMMER24', discountDisplay: '10% OFF', redemptions: 0, status: 'Active', type: 'percent', value: 10 },
  ]);

  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeType, setNewCodeType] = useState<'percent' | 'fixed'>('percent');
  const [newCodeValue, setNewCodeValue] = useState<number>(0);

  const handleUpdateSegmentConfig = (category: BusinessCategory, key: keyof SegmentConfig, value: number) => {
    setSegmentConfigs(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [key]: value
        }
    }));
  };

  const saveSegmentConfigs = () => {
    setIsSavingConfigs(true);
    // Fix: Explicitly cast entries to handle unknown type inference in some TS versions
    (Object.entries(segmentConfigs) as [BusinessCategory, SegmentConfig][]).forEach(([cat, config]) => {
        mockService.updateMarketSegmentConfig(cat, config);
    });
    setTimeout(() => {
        setIsSavingConfigs(false);
        alert("Market segment savings logic updated successfully!");
    }, 800);
  };

  const handleCreateCode = () => {
    if (!newCodeName || !newCodeValue) return;
    
    const newCode: PromoCode = {
      id: Date.now().toString(),
      code: newCodeName.toUpperCase(),
      discountDisplay: newCodeType === 'percent' ? `${newCodeValue}% OFF` : `$${newCodeValue} CREDIT`,
      redemptions: 0,
      status: 'Active',
      type: newCodeType,
      value: newCodeValue
    };

    setPromoCodes([...promoCodes, newCode]);
    setNewCodeName('');
    setNewCodeValue(0);
  };

  const handleDeleteCode = (id: string) => {
    if (confirm('Are you sure you want to remove this promo code?')) {
      setPromoCodes(promoCodes.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Growth & Incentives</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage how leads are captured and how users are rewarded.</p>
        </div>
      </div>

      <div className="flex space-x-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('growth')}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'growth' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Conversion Logic
          </button>
          <button 
            onClick={() => setActiveTab('credits')}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'credits' ? 'border-transparent text-gray-400 hover:text-gray-600'}`}
            disabled
          >
            Credits Economy
          </button>
      </div>

      {activeTab === 'growth' && (
        <div className="space-y-12">
          
          {/* NEW SECTION: LEAD COMPARISON SAVINGS LOGIC */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                          <Calculator size={32}/>
                      </div>
                      <div>
                          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Lead Generation Savings Logic</h2>
                          <p className="text-sm text-gray-500 font-medium">Control the automated savings % shown to leads during invoice comparison.</p>
                      </div>
                  </div>
                  <button 
                    onClick={saveSegmentConfigs}
                    disabled={isSavingConfigs}
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSavingConfigs ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                    Save Market Logic
                  </button>
              </div>

              <div className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {(Object.entries(segmentConfigs) as [BusinessCategory, SegmentConfig][]).map(([cat, config]) => (
                          <div key={cat} className="group p-6 bg-white border-2 border-gray-50 rounded-[2rem] hover:border-indigo-100 transition-all shadow-sm flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-6">
                                  <div>
                                      <h4 className="font-black text-gray-900 text-lg leading-none mb-1">{cat}</h4>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Segment</span>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded-xl text-gray-300 group-hover:text-indigo-500 transition-colors">
                                      <Store size={18}/>
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">
                                          <TrendingDown size={14}/> Landing Savings (%)
                                      </label>
                                      <div className="relative">
                                          <input 
                                              type="number"
                                              className="w-full bg-slate-50 border-2 border-slate-50 p-4 pr-10 rounded-2xl font-black text-xl text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                              value={config.targetSavings}
                                              onChange={(e) => handleUpdateSegmentConfig(cat as BusinessCategory, 'targetSavings', parseFloat(e.target.value))}
                                          />
                                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">%</span>
                                      </div>
                                  </div>

                                  <div className="space-y-2">
                                      <label className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">
                                          <Target size={14}/> Procurement Aim (%)
                                      </label>
                                      <div className="relative">
                                          <input 
                                              type="number"
                                              className="w-full bg-slate-50 border-2 border-slate-50 p-4 pr-10 rounded-2xl font-black text-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                              value={config.supplierTarget}
                                              onChange={(e) => handleUpdateSegmentConfig(cat as BusinessCategory, 'supplierTarget', parseFloat(e.target.value))}
                                          />
                                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">%</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase italic">
                                  <Sparkles size={12} className="text-indigo-300"/> 
                                  Auto-applied to new {cat} leads
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-10 bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 flex items-start gap-4">
                      <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm"><Info size={20}/></div>
                      <div className="text-sm text-indigo-700 leading-relaxed">
                          <p><strong>Platform Algorithm Tip:</strong> The "Landing Savings" is what the user sees as their potential gain. The "Procurement Aim" is the internal target we send to wholesalers. Keeping a 5-10% gap ensures Platform Zero's margin while providing value to the buyer.</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* New User Bonus Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner-sm">
                    <Gift size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">New User Bonus</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Incentivize new signups with free credits.</p>
                  </div>
                </div>
                <button onClick={() => setBonusEnabled(!bonusEnabled)} className="text-emerald-500 hover:text-emerald-600 transition-all active:scale-95">
                  {bonusEnabled ? <ToggleRight size={48} className="fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bonus Credits Amount</label>
                  <div className="relative group">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors"/>
                    <input 
                      type="number" 
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(parseFloat(e.target.value))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-black text-xl text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Campaign Start</label>
                    <input 
                      type="date" 
                      value={bonusStart}
                      onChange={(e) => setBonusStart(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Campaign End</label>
                    <input 
                      type="date" 
                      value={bonusEnd}
                      onChange={(e) => setBonusEnd(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Program Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner-sm">
                    <Users size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Viral Referral</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Reward users for expanding the network.</p>
                  </div>
                </div>
                <button onClick={() => setReferralEnabled(!referralEnabled)} className="text-emerald-500 hover:text-emerald-600 transition-all active:scale-95">
                  {referralEnabled ? <ToggleRight size={48} className="fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Referrer Reward</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg">$</span>
                      <input 
                        type="number" 
                        value={referrerAmount}
                        onChange={(e) => setReferrerAmount(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-xl text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Referee Reward</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg">$</span>
                      <input 
                        type="number" 
                        value={refereeAmount}
                        onChange={(e) => setRefereeAmount(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-xl text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F172A] rounded-[1.5rem] p-6 text-center mt-auto shadow-xl">
                  <h4 className="text-2xl font-black text-white mb-1 tracking-tight">"Give ${refereeAmount}, Get ${referrerAmount}"</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In-App Referral Message</p>
                </div>
              </div>
            </div>
          </div>

          {/* PROMO CODES SECTION */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner-sm">
                        <Tag size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Promo Codes</h3>
                        <p className="text-sm text-gray-500 font-medium">Create seasonal or campaign-specific discount codes.</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                    View Usage Analytics <ArrowRight size={14}/>
                </button>
            </div>

            <div className="p-8">
              {/* Creation Form */}
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 mb-10 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Promo Code Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SUMMER25"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-white bg-white rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none uppercase font-black text-gray-900 shadow-sm"
                  />
                </div>
                <div className="w-full md:w-40">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                  <select 
                    value={newCodeType}
                    onChange={(e) => setNewCodeType(e.target.value as any)}
                    className="w-full px-4 py-4 bg-white border-2 border-white rounded-2xl font-bold text-gray-900 shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="percent">Percentage %</option>
                    <option value="fixed">Fixed Credit $</option>
                  </select>
                </div>
                <div className="w-full md:w-40">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Value</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newCodeValue || ''}
                    onChange={(e) => setNewCodeValue(parseFloat(e.target.value))}
                    className="w-full px-6 py-4 bg-white border-2 border-white rounded-2xl font-black text-gray-900 shadow-sm"
                  />
                </div>
                <button 
                  onClick={handleCreateCode}
                  className="w-full md:w-auto px-10 py-4 bg-[#0F172A] hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95"
                >
                  Create Code
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-5">Active Promo Code</th>
                        <th className="px-6 py-5">In-App Discount</th>
                        <th className="px-6 py-5">Total Uses</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Management</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                    {promoCodes.map(code => (
                        <tr key={code.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-6 font-black text-gray-900 tracking-tight font-mono text-lg">{code.code}</td>
                        <td className="px-6 py-6">
                            <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-xs font-black border border-emerald-100 shadow-sm">{code.discountDisplay}</span>
                        </td>
                        <td className="px-6 py-6 font-bold text-gray-400">{code.redemptions} redemptions</td>
                        <td className="px-6 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            code.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                            {code.status}
                            </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                            <button 
                            onClick={() => handleDeleteCode(code.id)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                            >
                            <Trash2 size={20}/>
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <Calculator className={`animate-pulse ${className}`} size={size} />
);
