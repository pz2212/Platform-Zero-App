
import React, { useState } from 'react';
import { 
  Gift, Users, Tag, Calendar, Megaphone, Plus, Trash2, 
  ToggleLeft, ToggleRight, LayoutDashboard, Settings, DollarSign 
} from 'lucide-react';

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

  // --- PROMO CODES STATE ---
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: '1', code: 'WELCOME50', discountDisplay: '50% OFF', redemptions: 124, status: 'Active', type: 'percent', value: 50 },
    { id: '2', code: 'FREELUNCH', discountDisplay: '$15 CREDIT', redemptions: 45, status: 'Paused', type: 'fixed', value: 15 },
    { id: '3', code: 'SUMMER24', discountDisplay: '10% OFF', redemptions: 0, status: 'Active', type: 'percent', value: 10 },
  ]);

  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeType, setNewCodeType] = useState<'percent' | 'fixed'>('percent');
  const [newCodeValue, setNewCodeValue] = useState<number>(0);

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
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Portals</h1>
        <div className="flex space-x-8 border-b border-gray-200 mt-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Overview & Payouts
          </button>
          <button 
            onClick={() => setActiveTab('growth')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'growth' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Growth & Incentives
          </button>
          <button 
            onClick={() => setActiveTab('credits')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'credits' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Credits & Economy
          </button>
        </div>
      </div>

      {activeTab === 'growth' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* TOP ROW: CAMPAIGNS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* New User Bonus Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">New User Bonus</h3>
                    <p className="text-sm text-gray-500">Incentivize new signups with free credits.</p>
                  </div>
                </div>
                <button onClick={() => setBonusEnabled(!bonusEnabled)} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                  {bonusEnabled ? <ToggleRight size={40} className="fill-current"/> : <ToggleLeft size={40} className="text-gray-300"/>}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bonus Amount (Credits)</label>
                  <div className="relative">
                    <Gift size={16} className="absolute left-3 top-3 text-gray-400"/>
                    <input 
                      type="number" 
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(parseFloat(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-3 text-gray-400"/>
                      <input 
                        type="date" 
                        value={bonusStart}
                        onChange={(e) => setBonusStart(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-3 text-gray-400"/>
                      <input 
                        type="date" 
                        value={bonusEnd}
                        onChange={(e) => setBonusEnd(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {bonusEnabled && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
                    <Megaphone size={20} className="text-blue-600 shrink-0 mt-0.5"/>
                    <div className="text-sm text-blue-800">
                      <span className="font-bold">Active Campaign:</span> All new users signing up between {bonusStart} and {bonusEnd} will automatically receive <span className="font-bold">{bonusAmount} Credits</span>.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Referral Program Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Referral Program</h3>
                    <p className="text-sm text-gray-500">Reward users for inviting friends.</p>
                  </div>
                </div>
                <button onClick={() => setReferralEnabled(!referralEnabled)} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                  {referralEnabled ? <ToggleRight size={40} className="fill-current"/> : <ToggleLeft size={40} className="text-gray-300"/>}
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Referrer Gets</label>
                    <div className="relative">
                      <span className="absolute right-3 top-3 text-gray-400 text-xs font-bold">Credits</span>
                      <input 
                        type="number" 
                        value={referrerAmount}
                        onChange={(e) => setReferrerAmount(parseFloat(e.target.value))}
                        className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Referee Gets</label>
                    <div className="relative">
                      <span className="absolute right-3 top-3 text-gray-400 text-xs font-bold">Credits</span>
                      <input 
                        type="number" 
                        value={refereeAmount}
                        onChange={(e) => setRefereeAmount(parseFloat(e.target.value))}
                        className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mt-auto">
                  <h4 className="text-xl font-bold text-gray-800 mb-1">"Give {refereeAmount}, Get {referrerAmount}"</h4>
                  <p className="text-sm text-gray-500">This message will appear on the customer profile page.</p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: PROMO CODES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Tag size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Promo Codes</h3>
                  <p className="text-sm text-gray-500">Manage active discount codes.</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Creation Form */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. FLASH20"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-bold"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select 
                    value={newCodeType}
                    onChange={(e) => setNewCodeType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="percent">% Off</option>
                    <option value="fixed">$ Off</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Value</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newCodeValue || ''}
                    onChange={(e) => setNewCodeValue(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <button 
                  onClick={handleCreateCode}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 h-[42px]"
                >
                  <Plus size={18}/> Create
                </button>
              </div>

              {/* Table */}
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                  <tr>
                    <th className="py-3 pl-2">Code</th>
                    <th className="py-3">Discount</th>
                    <th className="py-3">Redemptions</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {promoCodes.map(code => (
                    <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pl-2 font-bold text-gray-900 font-mono">{code.code}</td>
                      <td className="py-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{code.discountDisplay}</span>
                      </td>
                      <td className="py-4 text-gray-500 font-medium">{code.redemptions} uses</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          code.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {code.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button 
                          onClick={() => handleDeleteCode(code.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'growth' && (
        <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20"/>
          <h3 className="text-lg font-medium text-gray-500">Dashboard View</h3>
          <p className="text-sm">This section is under construction.</p>
        </div>
      )}
    </div>
  );
};
