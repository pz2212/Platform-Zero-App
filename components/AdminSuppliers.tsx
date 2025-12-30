
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Store, Search, Plus, MoreVertical, MapPin, Phone, Mail, 
  ChevronRight, ArrowRight, TrendingUp, CheckCircle, Clock, 
  X, Building, Link as LinkIcon, Copy, Filter, Star, Truck, AlertTriangle,
  DollarSign,
  Eye,
  Trash2,
  Sprout
} from 'lucide-react';

export const AdminSuppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Quick Supplier Modal State
  const [isQuickSupplierModalOpen, setIsQuickSupplierModalOpen] = useState(false);
  const [quickSupplier, setQuickSupplier] = useState({ businessName: '', email: '', role: UserRole.WHOLESALER });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const refreshData = () => {
    const allUsers = mockService.getAllUsers();
    setSuppliers(allUsers.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
    setOrders(mockService.getOrders('u1'));
  };

  const getSupplierStats = (supplierId: string) => {
    const supplierOrders = orders.filter(o => o.sellerId === supplierId);
    const delivered = supplierOrders.filter(o => o.status === 'Delivered').length;
    const rate = supplierOrders.length > 0 ? (delivered / supplierOrders.length) * 100 : 0;
    const volume = supplierOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { count: supplierOrders.length, rate, volume };
  };

  const handleQuickSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = mockService.onboardNewBusiness({
        type: 'Supplier',
        businessName: quickSupplier.businessName,
        email: quickSupplier.email,
        phone: 'N/A',
        abn: 'N/A',
        address: 'N/A',
        customerType: 'Supplier',
        role: quickSupplier.role
    });
    
    const link = `https://portal.platformzero.io/setup/${newUser.id}`;
    setGeneratedLink(link);
    refreshData();
  };

  const handleDeleteSupplier = (id: string, name: string) => {
      if (confirm(`Permanently remove ${name} from the platform? This action cannot be undone.`)) {
          mockService.deleteUser(id);
          refreshData();
          setActiveMenuId(null);
      }
  };

  const copyLink = () => {
      if (generatedLink) {
          navigator.clipboard.writeText(generatedLink);
          alert("Link copied to clipboard!");
      }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Suppliers</h1>
            <p className="text-gray-500 font-medium">Manage network wholesalers and farmers and review fulfillment performance.</p>
        </div>
        <button 
            onClick={() => { setGeneratedLink(null); setQuickSupplier({businessName: '', email: '', role: UserRole.WHOLESALER}); setIsQuickSupplierModalOpen(true); }}
            className="px-6 py-3 bg-[#043003] hover:bg-black text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
        >
            <Plus size={20}/> Add New Supplier
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <Truck size={20}/>
                <span className="text-xs font-black uppercase tracking-widest">Active Partners</span>
            </div>
            <div className="text-3xl font-black text-gray-900">{suppliers.length}</div>
            <p className="text-xs text-gray-400 mt-1 font-medium">Farmers & Wholesalers combined</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-blue-600 mb-3">
                <CheckCircle size={20}/>
                <span className="text-xs font-black uppercase tracking-widest">Avg fulfillment Rate</span>
            </div>
            <div className="text-3xl font-black text-gray-900">94.2%</div>
            <p className="text-xs text-emerald-500 mt-1 font-bold flex items-center gap-1">
                <TrendingUp size={12}/> +2.1% from last month
            </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-indigo-600 mb-3">
                <DollarSign size={20}/>
                <span className="text-xs font-black uppercase tracking-widest">Partner GMV</span>
            </div>
            <div className="text-3xl font-black text-gray-900">${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1 font-medium">Total transaction volume processed</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-visible">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-gray-900 border border-gray-200 shadow-sm">
                    <Store size={24}/>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Partner List</h2>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search partners..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-gray-900 outline-none" 
                    />
                </div>
                <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                    <Filter size={20}/>
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                        <th className="px-8 py-5">Partner / Business</th>
                        <th className="px-8 py-5">Role</th>
                        <th className="px-8 py-5">Location</th>
                        <th className="px-8 py-5 text-center">Fulfillment Rate</th>
                        <th className="px-8 py-5 text-center">Order Count</th>
                        <th className="px-8 py-5 text-right">Volume (GMV)</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredSuppliers.map(supplier => {
                        const stats = getSupplierStats(supplier.id);
                        return (
                            <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                                            supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {supplier.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{supplier.businessName}</div>
                                            <div className="text-xs text-gray-400">{supplier.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                        supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {supplier.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                                        <MapPin size={12} className="text-gray-300"/> {supplier.businessProfile?.businessLocation || 'Australia'}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-sm font-black ${stats.rate > 90 ? 'text-emerald-600' : 'text-orange-600'}`}>{stats.rate.toFixed(1)}%</span>
                                        <div className="w-20 bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full ${stats.rate > 90 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{width: `${stats.rate}%`}}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center font-black text-gray-900">{stats.count}</td>
                                <td className="px-8 py-5 text-right font-black text-emerald-600">${stats.volume.toLocaleString()}</td>
                                <td className="px-8 py-5 text-right relative">
                                    <button onClick={() => setActiveMenuId(activeMenuId === supplier.id ? null : supplier.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                                        <MoreVertical size={20}/>
                                    </button>
                                    {activeMenuId === supplier.id && (
                                        <div ref={menuRef} className="absolute right-8 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden py-1">
                                            <button className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Eye size={18} className="text-gray-400"/> View Dashboard</button>
                                            <button className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><TrendingUp size={18} className="text-indigo-600"/> Analytics</button>
                                            <button className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Clock size={18} className="text-orange-500"/> Order History</button>
                                            <div className="h-px bg-gray-50 mx-2"></div>
                                            <button 
                                                onClick={() => handleDeleteSupplier(supplier.id, supplier.businessName)}
                                                className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"
                                            >
                                                <Trash2 size={18}/> Delete Supplier
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* QUICK ADD SUPPLIER MODAL */}
      {isQuickSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Quick Add Business</h2>
                      <button onClick={() => setIsQuickSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full border border-gray-100 shadow-sm"><X size={20}/></button>
                  </div>
                  <div className="p-8 space-y-6">
                      {!generatedLink ? (
                          <form onSubmit={handleQuickSupplierSubmit} className="space-y-6">
                              <p className="text-xs text-gray-500 font-medium leading-relaxed">Provide basic details to provision a specialized portal for your partner. They will appear in connection lists immediately.</p>
                              
                              {/* ROLE SELECTOR */}
                              <div className="space-y-2">
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Business Role</label>
                                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                                      <button 
                                        type="button"
                                        onClick={() => setQuickSupplier({...quickSupplier, role: UserRole.WHOLESALER})}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${quickSupplier.role === UserRole.WHOLESALER ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                          <Building size={16}/> Wholesaler
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => setQuickSupplier({...quickSupplier, role: UserRole.FARMER})}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${quickSupplier.role === UserRole.FARMER ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-emerald-600'}`}
                                      >
                                          <Sprout size={16}/> Farmer
                                      </button>
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Trading Name</label>
                                  <div className="relative">
                                      <Building className="absolute left-3 top-3 text-gray-400" size={18}/>
                                      <input 
                                          required 
                                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-gray-900 font-bold" 
                                          placeholder="e.g. Green Farms Ltd"
                                          value={quickSupplier.businessName}
                                          onChange={e => setQuickSupplier({...quickSupplier, businessName: e.target.value})}
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Login Email</label>
                                  <div className="relative">
                                      <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
                                      <input 
                                          required 
                                          type="email"
                                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-gray-900 font-bold" 
                                          placeholder="partner@email.com"
                                          value={quickSupplier.email}
                                          onChange={e => setQuickSupplier({...quickSupplier, email: e.target.value})}
                                      />
                                  </div>
                              </div>
                              <button type="submit" className="w-full py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                                  Generate Invite & Provision Portal
                              </button>
                          </form>
                      ) : (
                          <div className="text-center space-y-6 animate-in fade-in duration-300">
                              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                  <LinkIcon size={32} />
                              </div>
                              <div>
                                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Portal Link Ready</h3>
                                  <p className="text-xs text-gray-500 font-medium mt-1">Share this link with <span className="font-bold text-gray-900">{quickSupplier.businessName}</span>. They will be directed to their specialized {quickSupplier.role} dashboard.</p>
                              </div>
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                  <input readOnly value={generatedLink} className="bg-transparent flex-1 text-[10px] font-mono text-gray-900 font-black outline-none" />
                                  <button onClick={copyLink} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
                                      <Copy size={16}/>
                                  </button>
                              </div>
                              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-left flex gap-3">
                                  <CheckCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-indigo-800 leading-relaxed font-medium">
                                      <strong>Instant Availability:</strong> This partner is now an option in connection dropdowns across the platform.
                                  </p>
                              </div>
                              <button onClick={() => setIsQuickSupplierModalOpen(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                                  Done
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
