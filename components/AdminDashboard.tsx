
import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, User, UserRole, OnboardingFormTemplate, FormField, Order, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Package, Users, AlertTriangle, Check, X, Settings, LayoutDashboard, 
  Box, FileText, Plus, Trash2, GripVertical, Save, ShoppingCart, 
  TrendingUp, DollarSign, CheckCircle, Search, MoreVertical, 
  Store, Eye, Edit, UserCheck, CreditCard, ChevronDown, UserPlus, Filter, UserCog, Percent, ExternalLink, Download, Printer, ChevronUp
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'orders' | 'forms'>('overview');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [reps, setReps] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  
  // Mobile UI States
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

  // Invoice Viewer State
  const [viewingInvoicesCustomer, setViewingInvoicesCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Order[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Modal / Edit States
  const [editingMarkupId, setEditingMarkupId] = useState<string | null>(null);
  const [tempMarkup, setTempMarkup] = useState<number>(0);

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CONSUMER);
  const [formTemplate, setFormTemplate] = useState<OnboardingFormTemplate | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (activeTab === 'forms') {
          const template = mockService.getFormTemplate(selectedRole);
          if (template) setFormTemplate(JSON.parse(JSON.stringify(template)));
      }
  }, [activeTab, selectedRole]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setActiveActionMenu(null);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshData = () => {
    setInventory(mockService.getAllInventory());
    const allUsers = mockService.getAllUsers();
    setUsers(allUsers);
    const orders = mockService.getOrders('u1');
    setAllOrders(orders);
    setCustomers(mockService.getCustomers());
    setWholesalers(allUsers.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
    setReps(allUsers.filter(u => u.role === UserRole.PZ_REP));
  };

  const handleApprove = (itemId: string) => {
    mockService.updateInventoryStatus(itemId, 'Available');
    refreshData();
  };

  const handleReject = (itemId: string) => {
    mockService.updateInventoryStatus(itemId, 'Rejected');
    refreshData();
  };

  const handleUpdateMarkup = (customerId: string) => {
      mockService.updateCustomerMarkup(customerId, tempMarkup);
      setEditingMarkupId(null);
      refreshData();
  };

  const handleUpdateSupplier = (customerId: string, supplierId: string) => {
      mockService.updateCustomerSupplier(customerId, supplierId);
      refreshData();
  };

  const handleUpdateRep = (customerId: string, repId: string) => {
      mockService.updateCustomerRep(customerId, repId);
      refreshData();
  };

  const handleOpenInvoices = (customer: Customer) => {
      const history = allOrders.filter(o => o.buyerId === customer.id);
      setCustomerInvoices(history);
      setViewingInvoicesCustomer(customer);
  };

  const getCustomerMetrics = (customerId: string) => {
    const orders = allOrders.filter(o => o.buyerId === customerId);
    const orderCount = orders.length;
    const activeInvoices = orders.filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue').length;
    const outstanding = orders
      .filter(o => o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const ltv = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return { orderCount, activeInvoices, outstanding, ltv };
  };

  const toggleActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const handleSaveTemplate = () => {
    if (formTemplate) {
      mockService.updateFormTemplate(selectedRole, formTemplate);
      alert(`${selectedRole} onboarding form updated!`);
    }
  };

  const addField = (sectionIdx: number) => {
    if (!formTemplate) return;
    const newTemplate = { ...formTemplate };
    const newField: FormField = {
      id: `f-${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false
    };
    newTemplate.sections[sectionIdx].fields.push(newField);
    setFormTemplate(newTemplate);
  };

  const updateField = (sectionIdx: number, fieldIdx: number, key: string, value: any) => {
    if (!formTemplate) return;
    const newTemplate = JSON.parse(JSON.stringify(formTemplate));
    // @ts-ignore
    newTemplate.sections[sectionIdx].fields[fieldIdx][key] = value;
    setFormTemplate(newTemplate);
  };

  const removeField = (sectionIdx: number, fieldIdx: number) => {
    if (!formTemplate) return;
    const newTemplate = JSON.parse(JSON.stringify(formTemplate));
    newTemplate.sections[sectionIdx].fields.splice(fieldIdx, 1);
    setFormTemplate(newTemplate);
  };

  const totalWholesalers = users.filter(u => u.role === 'WHOLESALER').length;
  const pendingItems = inventory.filter(i => i.status === 'Pending Approval');
  const totalGMV = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Platform Control Center</h1>
            <p className="text-gray-500 font-medium">Managing marketplace operations and network health.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto border border-gray-200">
            {[
                {id: 'overview', label: 'Overview', icon: LayoutDashboard},
                {id: 'pending', label: 'Approvals', icon: AlertTriangle},
                {id: 'orders', label: 'All Orders', icon: ShoppingCart},
                {id: 'forms', label: 'Forms', icon: FileText}
            ].map(t => (
                <button 
                    key={t.id} onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex-1 md:flex-none flex items-center gap-2 ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <t.icon size={16}/> {t.label}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Section with Mobile Compression */}
            <div className="block md:hidden">
                <button 
                    onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                    className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shadow-sm">
                            <DollarSign size={24}/>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total GMV (Live)</p>
                            <h3 className="text-2xl font-black text-gray-900">${totalGMV.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                        {isMetricsExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                </button>

                {isMetricsExpanded && (
                    <div className="mt-4 grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><ShoppingCart size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders Handled</p>
                                <h3 className="text-xl font-black text-gray-900">{allOrders.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Box size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Stock</p>
                                <h3 className="text-xl font-black text-gray-900">{inventory.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-500"><Users size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Wholesalers</p>
                                <h3 className="text-xl font-black text-gray-900">{totalWholesalers}</h3>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Full Metrics Grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 group hover:shadow-md transition-all">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total GMV</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-black text-gray-900">${totalGMV.toLocaleString()}</h3>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 group hover:shadow-md transition-all">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Orders Handled</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-black text-gray-900">{allOrders.length}</h3>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShoppingCart size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 group hover:shadow-md transition-all">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Partner Stock</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-black text-gray-900">{inventory.length}</h3>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Box size={20} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 group hover:shadow-md transition-all">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Wholesalers</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-black text-gray-900">{totalWholesalers}</h3>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-500"><Users size={20} /></div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-visible">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-900 border border-gray-200">
                            <Store size={24}/>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Marketplace Customers</h2>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search customers..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-gray-900 outline-none" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Type</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Connected Supplier</th>
                                <th className="px-6 py-5">Assigned Rep</th>
                                <th className="px-6 py-5">PZ Markup</th>
                                <th className="px-6 py-5">Pricing Status</th>
                                <th className="px-6 py-5 text-center">Orders</th>
                                <th className="px-6 py-5 text-center">Invoices</th>
                                <th className="px-6 py-5">Outstanding</th>
                                <th className="px-6 py-5">LTV</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredCustomers.map(customer => {
                                const metrics = getCustomerMetrics(customer.id);
                                return (
                                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-900">{customer.businessName}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">{customer.email || 'No email saved'}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap">
                                                {customer.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${
                                                customer.connectionStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                customer.connectionStatus === 'Pending Connection' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {customer.connectionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <select 
                                                value={customer.connectedSupplierId || ''} 
                                                onChange={(e) => handleUpdateSupplier(customer.id, e.target.value)}
                                                className="bg-transparent border-0 font-bold text-gray-900 text-xs focus:ring-0 outline-none p-0 w-full cursor-pointer hover:text-blue-600 transition-colors"
                                            >
                                                <option value="" className="text-gray-900">Not connected</option>
                                                {wholesalers.map(w => <option key={w.id} value={w.id} className="text-gray-900 font-bold">{w.businessName}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-5">
                                            <select 
                                                value={customer.assignedPzRepId || ''} 
                                                onChange={(e) => handleUpdateRep(customer.id, e.target.value)}
                                                className="bg-transparent border-0 font-bold text-gray-900 text-xs focus:ring-0 outline-none p-0 w-full cursor-pointer hover:text-indigo-600 transition-colors"
                                            >
                                                <option value="" className="text-gray-900">Unassigned</option>
                                                {reps.map(r => <option key={r.id} value={r.id} className="text-gray-900 font-bold">{r.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-5">
                                            {editingMarkupId === customer.id ? (
                                                <div className="flex items-center gap-1 animate-in zoom-in-95">
                                                    <input 
                                                        type="number" 
                                                        className="w-12 p-1 border border-gray-200 rounded text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                                                        value={tempMarkup} 
                                                        onChange={(e) => setTempMarkup(parseInt(e.target.value))}
                                                    />
                                                    <button onClick={() => handleUpdateMarkup(customer.id)} className="p-1 bg-emerald-500 text-white rounded"><Check size={12}/></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group/markup">
                                                    {customer.pzMarkup ? (
                                                        <span className="text-sm font-black text-emerald-600">%{customer.pzMarkup}</span>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">None</span>
                                                    )}
                                                    <button onClick={() => { setEditingMarkupId(customer.id); setTempMarkup(customer.pzMarkup || 0); }} className="p-1 text-gray-300 hover:text-indigo-600 opacity-0 group-hover/markup:opacity-100 transition-all">
                                                        <Edit size={12}/>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${
                                                customer.pricingStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                customer.pricingStatus === 'Pending PZ Approval' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-gray-50 text-gray-500 border-gray-200'
                                            }`}>
                                                {customer.pricingStatus || 'Not Set'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-gray-900">{metrics.orderCount}</td>
                                        <td className="px-6 py-5 text-center">
                                            <button 
                                                onClick={() => handleOpenInvoices(customer)}
                                                className="flex items-center justify-center gap-1.5 font-bold text-emerald-700 hover:underline w-full"
                                            >
                                                <FileText size={14}/> {metrics.orderCount} Total
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            {metrics.outstanding > 0 ? (
                                                <div className="flex items-center gap-1.5 font-black text-red-600 whitespace-nowrap">
                                                    <AlertTriangle size={14} className="animate-pulse"/> ${metrics.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 font-bold">$0</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 font-black text-gray-900 whitespace-nowrap">
                                            ${metrics.ltv.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                        </td>
                                        <td className="px-6 py-5 text-right relative">
                                            <button onClick={(e) => toggleActionMenu(e, customer.id)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                                                <MoreVertical size={20}/>
                                            </button>
                                            {activeActionMenu === customer.id && (
                                                <div ref={menuRef} className="absolute right-8 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden py-1">
                                                    <button className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Eye size={18} className="text-gray-400"/> View Profile</button>
                                                    <div className="h-px bg-gray-50 mx-2"></div>
                                                    <button onClick={() => { setEditingMarkupId(customer.id); setTempMarkup(customer.pzMarkup || 0); setActiveActionMenu(null); }} className="w-full text-left px-5 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3"><Percent size={18}/> Edit Markup</button>
                                                    <button className="w-full text-left px-5 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-3"><TrendingUp size={18}/> Set Pricing Tier</button>
                                                    <button className="w-full text-left px-5 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-3"><Settings size={18}/> Configure Settings</button>
                                                    <div className="h-px bg-gray-50 mx-2"></div>
                                                    <button className="w-full text-left px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-3"><UserCog size={18} className="text-gray-400"/> Assign Management</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredCustomers.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={40} className="text-gray-200"/>
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No customers match your search.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 font-black text-gray-900 text-lg flex items-center gap-2 bg-gray-50/50">
                <AlertTriangle size={24} className="text-orange-500"/> Farmer Stock Approvals
            </div>
            <div className="divide-y divide-gray-100">
                {pendingItems.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <CheckCircle size={48} className="text-emerald-500 mb-4 opacity-20"/>
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No pending items to review.</p>
                    </div>
                ) : pendingItems.map(item => {
                    const product = mockService.getProduct(item.productId);
                    return (
                        <div key={item.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                    <img src={product?.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">{product?.name} • {item.quantityKg}kg</h3>
                                    <p className="text-sm font-medium text-emerald-600">Farmer: {item.originalFarmerName}</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-tighter">Harvested: {new Date(item.harvestDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => handleApprove(item.id)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 shadow-md flex items-center gap-2">
                                    <Check size={18} /> Approve
                                </button>
                                <button onClick={() => handleReject(item.id)} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                                    <X size={20}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 font-black flex justify-between items-center bg-gray-50/50">
                <span className="text-lg text-gray-900 flex items-center gap-2">
                    <ShoppingCart size={24} className="text-indigo-600"/> Live Marketplace Traffic
                </span>
                <span className="text-xs bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 font-black uppercase tracking-widest">{allOrders.length} In-Network Orders</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5">ID / Date</th>
                            <th className="px-8 py-5">Buyer</th>
                            <th className="px-8 py-5">Supplier / Partner</th>
                            <th className="px-8 py-5">Total Amount</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Accounting</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/80 text-sm transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="font-mono font-bold text-gray-900">#{o.id.split('-')[1] || o.id}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(o.date).toLocaleDateString()}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="font-black text-gray-900">{mockService.getCustomers().find(c => c.id === o.buyerId)?.businessName || 'User'}</div>
                                    <div className="text-xs text-gray-400">Order from Marketplace</div>
                                </td>
                                <td className="px-8 py-5 font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="font-bold text-gray-900">{mockService.getAllUsers().find(u => u.id === o.sellerId)?.businessName || 'Supplier'}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 uppercase pl-4">Fulfillment Partner</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="font-black text-emerald-700 text-lg">${o.totalAmount.toFixed(2)}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                        o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' : 
                                        o.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                        'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 px-2 py-1 rounded">
                                        Categorized: Payables/Rec.
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'forms' && formTemplate && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Form Logic Builder</h2>
                        <p className="text-gray-500">Customize the onboarding experience for each role.</p>
                    </div>
                    <div className="flex gap-4">
                        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole)} className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value={UserRole.CONSUMER} className="text-gray-900">Buyer Experience</option>
                            <option value={UserRole.WHOLESALER} className="text-gray-900">Wholesaler Flow</option>
                            <option value={UserRole.FARMER} className="text-gray-900">Farmer Intake</option>
                        </select>
                        <button onClick={handleSaveTemplate} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-lg flex items-center gap-2">
                            <Save size={18}/> Save Schema
                        </button>
                    </div>
                </div>
                <div className="space-y-8">
                    {formTemplate.sections.map((section, sIdx) => (
                        <div key={section.id} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-inner">
                            <div className="p-4 bg-gray-100 font-black uppercase text-xs tracking-[0.2em] text-gray-500 flex justify-between items-center">
                                <span>Section: {section.title}</span>
                                <Settings size={14}/>
                            </div>
                            <div className="p-6 space-y-4">
                                {section.fields.map((field, fIdx) => (
                                    <div key={field.id} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl group hover:border-indigo-300 transition-all shadow-sm">
                                        <div className="mt-3 text-gray-300 cursor-move"><GripVertical size={20}/></div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Label / Question</label>
                                                <input type="text" value={field.label} onChange={(e) => updateField(sIdx, fIdx, 'label', e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Input Type</label>
                                                <select value={field.type} onChange={(e) => updateField(sIdx, fIdx, 'type', e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                                    <option value="text" className="text-gray-900">Short Answer</option>
                                                    <option value="textarea" className="text-gray-900">Paragraph</option>
                                                    <option value="number" className="text-gray-900">Number</option>
                                                    <option value="checkbox" className="text-gray-900">Toggle / Check</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" checked={field.required} onChange={(e) => updateField(sIdx, fIdx, 'required', e.target.checked)} />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase">Req.</span>
                                                </div>
                                                <button onClick={() => removeField(sIdx, fIdx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addField(sIdx)} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white text-xs font-black uppercase tracking-widest transition-all group">
                                    <Plus size={18} className="inline mr-2 group-hover:scale-110 transition-transform"/> Add Form Field
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      )}

      {/* --- INVOICE LIST MODAL --- */}
      {viewingInvoicesCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900">Account History: {viewingInvoicesCustomer.businessName}</h2>
                          <p className="text-sm text-gray-500">Managing {customerInvoices.length} total orders/invoices</p>
                      </div>
                      <button onClick={() => setViewingInvoicesCustomer(null)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                      {customerInvoices.length === 0 ? (
                          <div className="text-center py-20 text-gray-400">No invoices found for this business.</div>
                      ) : (
                          <table className="w-full text-left">
                              <thead className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                  <tr>
                                      <th className="pb-4 px-2">Date</th>
                                      <th className="pb-4 px-2">Invoice #</th>
                                      <th className="pb-4 px-2">Total Amount</th>
                                      <th className="pb-4 px-2">Due Date</th>
                                      <th className="pb-4 px-2">Status</th>
                                      <th className="pb-4 px-2 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                  {customerInvoices.map(invoice => (
                                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="py-4 px-2 text-sm font-bold text-gray-900">{new Date(invoice.date).toLocaleDateString()}</td>
                                          <td className="py-4 px-2 font-mono text-sm text-gray-900">#{invoice.id.split('-')[1] || invoice.id}</td>
                                          <td className="py-4 px-2 font-black text-gray-900">${invoice.totalAmount.toFixed(2)}</td>
                                          <td className="py-4 px-2 text-sm text-gray-500">{new Date(new Date(invoice.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                                          <td className="py-4 px-2">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : invoice.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                  {invoice.paymentStatus || 'Unpaid'}
                                              </span>
                                          </td>
                                          <td className="py-4 px-2 text-right">
                                              <button 
                                                  onClick={() => setSelectedInvoice(invoice)}
                                                  className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1 ml-auto"
                                              >
                                                  View Detailed <ExternalLink size={14}/>
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
                  <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                      <button onClick={() => setViewingInvoicesCustomer(null)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">Close Viewer</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- DETAILED INVOICE MODAL --- */}
      {selectedInvoice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                      <div>
                          <div className="flex items-center gap-3 mb-1">
                              <h2 className="text-2xl font-bold text-gray-900">Tax Invoice</h2>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedInvoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : selectedInvoice.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {selectedInvoice.paymentStatus || 'Unpaid'}
                              </span>
                          </div>
                          <p className="text-sm text-gray-500 font-mono">Reference: #{selectedInvoice.id}</p>
                      </div>
                      <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="p-8 space-y-10 bg-white">
                      <div className="flex flex-col sm:flex-row justify-between gap-8 text-sm">
                          <div>
                              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supplier</h3>
                              <p className="font-bold text-gray-900">{wholesalers.find(u => u.id === selectedInvoice.sellerId)?.businessName || 'Platform Zero Partner'}</p>
                              <p className="text-gray-500 mt-1">Direct Wholesale Marketplace</p>
                          </div>
                          <div className="sm:text-right">
                              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer</h3>
                              <p className="font-bold text-gray-900">{customers.find(c => c.id === selectedInvoice.buyerId)?.businessName}</p>
                              <p className="text-gray-500 mt-1">{customers.find(c => c.id === selectedInvoice.buyerId)?.email}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div><span className="text-[10px] font-bold text-gray-400 uppercase">Date</span><p className="text-sm font-bold text-gray-900">{new Date(selectedInvoice.date).toLocaleDateString()}</p></div>
                          <div><span className="text-[10px] font-bold text-gray-400 uppercase">Due</span><p className="text-sm font-bold text-gray-900">{new Date(new Date(selectedInvoice.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p></div>
                          <div><span className="text-[10px] font-bold text-gray-400 uppercase">Status</span><p className="text-sm font-bold text-emerald-600 uppercase">{selectedInvoice.paymentStatus || 'Unpaid'}</p></div>
                          <div><span className="text-[10px] font-bold text-gray-400 uppercase">Balance Due</span><p className="text-lg font-black text-gray-900">${selectedInvoice.totalAmount.toFixed(2)}</p></div>
                      </div>

                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="border-b-2 border-gray-100">
                                  <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Item</th>
                                  <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Qty</th>
                                  <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Price</th>
                                  <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {selectedInvoice.items.map((item, idx) => (
                                  <tr key={idx}>
                                      <td className="py-4"><div className="font-bold text-gray-900 text-sm">{mockService.getProduct(item.productId)?.name}</div></td>
                                      <td className="py-4 text-right text-sm font-black text-gray-900">{item.quantityKg} kg</td>
                                      <td className="py-4 text-right text-sm text-gray-500 font-bold">${item.pricePerKg.toFixed(2)}</td>
                                      <td className="py-4 text-right text-sm font-black text-gray-900">${(item.quantityKg * item.pricePerKg).toFixed(2)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                          <div className="w-64 space-y-3">
                              <div className="flex justify-between text-sm font-medium text-gray-500"><span>Subtotal</span><span className="text-gray-900 font-bold">${selectedInvoice.totalAmount.toFixed(2)}</span></div>
                              <div className="flex justify-between text-sm font-medium text-gray-500"><span>GST (10%)</span><span className="text-gray-900 font-bold">${(selectedInvoice.totalAmount * 0.1).toFixed(2)}</span></div>
                              <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t border-gray-900"><span>Total Due</span><span>${(selectedInvoice.totalAmount * 1.1).toFixed(2)}</span></div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex gap-2">
                          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"><Printer size={16}/> Print</button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"><Download size={16}/> PDF</button>
                      </div>
                      <button onClick={() => setSelectedInvoice(null)} className="w-full sm:w-auto px-10 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-md">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
