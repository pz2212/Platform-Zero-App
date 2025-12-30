
import React, { useState, useEffect } from 'react';
import { User, Customer, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Users, AlertCircle, CheckCircle, MessageSquare, TrendingUp, 
  DollarSign, Clock, Calendar, ChevronRight, Filter, Search
} from 'lucide-react';

interface RepDashboardProps {
  user: User;
}

export const RepDashboard: React.FC<RepDashboardProps> = ({ user }) => {
  const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>([]);
  const [activeIssues, setActiveIssues] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>({
      totalSales: 0,
      commissionMade: 0,
      commissionComing: 0,
      customerCount: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'commissions'>('overview');

  useEffect(() => {
    // Load assigned customers
    const customers = mockService.getRepCustomers(user.id);
    setAssignedCustomers(customers);
    
    // Load Issues
    setActiveIssues(mockService.getRepIssues(user.id));

    // Load Financial Stats
    const repStats = mockService.getRepStats(user.id);
    setStats(repStats);
  }, [user]);

  // Derived Commission Log
  const commissionLog = stats.orders ? stats.orders.map((o: Order) => ({
      id: o.id,
      date: o.date,
      customerName: assignedCustomers.find(c => c.id === o.buyerId)?.businessName || 'Unknown',
      amount: o.totalAmount,
      commission: o.totalAmount * ((user.commissionRate || 0) / 100),
      status: o.paymentStatus
  })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="space-y-8 pb-20">
        {/* Header Section */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Hello, {user.name.split(' ')[0]}</h1>
                        <p className="text-slate-400">Sales Representative • {user.commissionRate}% Commission Rate</p>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Current Month</span>
                        <Calendar size={16} className="text-emerald-400"/>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KPI Card 1: Money Made */}
                    <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-300 mb-2 font-bold text-sm uppercase tracking-wide">
                            <CheckCircle size={16}/> Money Made
                        </div>
                        <div className="text-4xl font-bold tracking-tight mb-1">
                            ${stats.commissionMade.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        <div className="text-xs text-slate-400">Paid Commissions (YTD)</div>
                    </div>

                    {/* KPI Card 2: Money Coming */}
                    <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                        <div className="flex items-center gap-2 text-orange-300 mb-2 font-bold text-sm uppercase tracking-wide">
                            <Clock size={16}/> Money Coming
                        </div>
                        <div className="text-4xl font-bold tracking-tight mb-1">
                            ${stats.commissionComing.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        <div className="text-xs text-slate-400">Pending Invoices</div>
                    </div>

                    {/* KPI Card 3: Active Leads */}
                    <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                        <div className="flex items-center gap-2 text-blue-300 mb-2 font-bold text-sm uppercase tracking-wide">
                            <Users size={16}/> My Pipeline
                        </div>
                        <div className="text-4xl font-bold tracking-tight mb-1">
                            {stats.customerCount}
                        </div>
                        <div className="text-xs text-slate-400">Active Accounts Managed</div>
                    </div>
                </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Overview & Issues
            </button>
            <button 
                onClick={() => setActiveTab('leads')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'leads' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                My Leads ({assignedCustomers.length})
            </button>
            <button 
                onClick={() => setActiveTab('commissions')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'commissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Commission Log
            </button>
        </div>

        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                {/* Active Tickets Panel */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" /> Action Required (Tickets)
                    </h2>
                    
                    {activeIssues.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                            <CheckCircle size={48} className="mx-auto text-green-400 mb-3"/>
                            <p className="text-gray-500 font-medium">All clear! No active issues.</p>
                        </div>
                    ) : (
                        activeIssues.map(order => {
                            const customer = assignedCustomers.find(c => c.id === order.buyerId);
                            return (
                                <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{customer?.businessName}</h3>
                                            <p className="text-sm text-gray-500">Order #{order.id}</p>
                                        </div>
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">{order.issue?.type}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded border border-gray-100 mb-4">
                                        "{order.issue?.description}"
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Reported: {new Date(order.issue?.reportedAt!).toLocaleTimeString()}</span>
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1">
                                            Resolve <ChevronRight size={14}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Recent Activity Mini-Feed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Sales Activity</h3>
                    <div className="space-y-4">
                        {commissionLog.slice(0, 5).map((log: any) => (
                            <div key={log.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                        <DollarSign size={18}/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{log.customerName}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">+${log.commission.toFixed(2)}</p>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${log.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {log.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* TAB CONTENT: LEADS */}
        {activeTab === 'leads' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Assigned Accounts</h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        <input type="text" placeholder="Search accounts..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Business Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Connected Supplier</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {assignedCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{customer.businessName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {customer.contactName}<br/>
                                    <span className="text-xs text-gray-400">{customer.email}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                        {customer.connectionStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{customer.connectedSupplierName || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* TAB CONTENT: COMMISSIONS */}
        {activeTab === 'commissions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Detailed Commission Log</h3>
                    <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                        <Filter size={14}/> Filter Date
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4 text-right">Order Value</th>
                            <th className="px-6 py-4 text-right">Commission ({user.commissionRate}%)</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {commissionLog.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(log.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{log.customerName}</td>
                                <td className="px-6 py-4 text-right text-sm text-gray-600">${log.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-600">+${log.commission.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        log.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {log.status === 'Paid' ? 'Realized' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};
