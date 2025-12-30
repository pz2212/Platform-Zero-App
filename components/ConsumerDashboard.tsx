import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  TrendingUp, DollarSign, Calendar, AlertCircle, ArrowRight, FileText, 
  ShoppingBag, X, MapPin, Store, CheckCircle, Upload, Loader2, Link as LinkIcon, 
  Truck, Package, Clock, AlertTriangle, Download, 
  Leaf, Camera, ChevronDown, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar
} from 'recharts';

interface ConsumerDashboardProps {
  user: User;
}

const IssueReportModal = ({ isOpen, onClose, itemName, onSubmit }: any) => {
    const [issueType, setIssueType] = useState('Select issue type');
    const [replacement, setReplacement] = useState('Select replacement timing');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-lg text-gray-900">Report Issue - {itemName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Issue Type</label>
                        <div className="relative">
                            <select 
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-700"
                            >
                                <option disabled>Select issue type</option>
                                <option>Missing Items</option>
                                <option>Quality Issues</option>
                                <option>Extra Items Received</option>
                                <option>Damaged Packaging</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Photo Evidence</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                            <Camera size={32} className="mb-2"/>
                            <p className="text-sm font-medium text-center">Click to upload photos</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Replacement Required?</label>
                        <div className="relative">
                            <select 
                                value={replacement}
                                onChange={(e) => setReplacement(e.target.value)}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-gray-500 text-gray-700"
                            >
                                <option disabled>Select replacement timing</option>
                                <option>Send with next order</option>
                                <option>Immediate replacement needed</option>
                                <option>Credit only (No replacement)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100">
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onSubmit({ type: issueType, action: replacement }); onClose(); }}
                        className="flex-1 py-3 bg-[#043003] text-white font-bold rounded-lg hover:bg-[#064004] shadow-sm"
                    >
                        Submit Issue
                    </button>
                </div>
            </div>
        </div>
    );
};

const VerificationModal = ({ isOpen, onClose, order, onComplete }: any) => {
    const [timeLeft, setTimeLeft] = useState<number>(3600);
    const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({});
    const [reportedItems, setReportedItems] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!isOpen || !order) return;
        const deadline = Date.now() + 3600 * 1000;
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                    <h2 className="text-xl font-bold text-gray-900">Verify Delivery - #{order.id.split('-')[1] || order.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="px-6 py-4 flex items-center gap-3 bg-red-50 text-red-700">
                    <Clock size={20} className="animate-pulse"/>
                    <p className="font-bold text-sm">Verification Timer: {formatTime(timeLeft)} remaining</p>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => {
                            const product = mockService.getProduct(item.productId);
                            return (
                                <div key={idx} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{product?.name}</h4>
                                        <p className="text-sm text-gray-500">{item.quantityKg}kg @ ${item.pricePerKg.toFixed(2)}</p>
                                    </div>
                                    <button 
                                        onClick={() => setVerifiedItems(prev => ({...prev, [item.productId]: !prev[item.productId]}))}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm ${verifiedItems[item.productId] ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
                                    >
                                        {verifiedItems[item.productId] ? 'Verified' : 'Verify'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button 
                        onClick={() => onComplete()}
                        className="w-full py-3 bg-[#043003] text-white rounded-lg font-bold hover:bg-[#064004]"
                    >
                        Complete Verification
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Recent Orders'); 
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [showVerification, setShowVerification] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [liveTimer, setLiveTimer] = useState<string>('59:59');

  useEffect(() => {
    const fetchOrders = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setRecentOrders(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const spendingHistory = [
    { month: 'Jan', spend: 4200 },
    { month: 'Feb', spend: 3800 },
    { month: 'Mar', spend: 5100 },
    { month: 'Apr', spend: 4800 },
    { month: 'May', spend: 5400 },
    { month: 'Jun', spend: 6100 },
  ];

  const dailyStats = {
    revenue: 2847.50,
    covers: 127,
    avgPerCover: 22.42,
    date: new Date().toLocaleDateString()
  };

  const activeOrder = recentOrders.find(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status));
  const isPrepared = activeOrder ? ['Ready for Delivery', 'Shipped', 'Delivered'].includes(activeOrder.status) : false;
  const isShipped = activeOrder ? ['Shipped', 'Delivered'].includes(activeOrder.status) : false;
  const isDelivered = activeOrder ? activeOrder.status === 'Delivered' : false;

  const steps = [
      { label: 'Order Confirmed', done: true },
      { label: 'Order Prepared', done: isPrepared },
      { label: 'Out for Delivery', done: isShipped },
      { label: 'Delivered', done: isDelivered }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Monthly Spend</p>
            <h3 className="text-3xl font-bold text-gray-900">$10,247</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Active Deliveries</p>
            <h3 className="text-3xl font-bold text-blue-600">{recentOrders.filter(o => o.status !== 'Delivered').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">CO2 Saved</p>
            <h3 className="text-3xl font-bold text-emerald-600">842kg</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Impact Tier</p>
            <h3 className="text-3xl font-bold text-indigo-600">Gold</h3>
        </div>
      </div>

      <div className="bg-gray-100/50 p-1 rounded-lg flex w-full border border-gray-200">
          {['Recent Orders', 'Daily Overview', 'Spend Analytics'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Recent Orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
              <div className="flex flex-col">
                  {activeOrder ? (
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                              <h2 className="text-xl font-bold text-gray-900">Live Order Tracking</h2>
                              <span className="text-xs font-bold text-gray-400">Order #{activeOrder.id.split('-')[1]}</span>
                          </div>
                          <div className="p-6 flex-1 space-y-8">
                              <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
                                  <div>
                                      <p className="font-bold text-gray-900">Status: {activeOrder.status}</p>
                                      <p className="text-sm text-gray-500">ETA: {activeOrder.logistics?.deliveryTime || 'Updating...'}</p>
                                  </div>
                                  <Truck size={24} className="text-blue-600"/>
                              </div>
                              <div className="space-y-6 relative pl-4 border-l-2 border-gray-100">
                                  {steps.map((step, idx) => (
                                      <div key={idx} className="flex items-center gap-4 relative">
                                          <div className={`w-3 h-3 rounded-full absolute -left-[23px] ${step.done ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-gray-300'}`}></div>
                                          <p className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                      </div>
                                  ))}
                              </div>
                              {activeOrder.status === 'Delivered' && (
                                  <button 
                                      onClick={() => { setVerifyingOrder(activeOrder); setShowVerification(true); }}
                                      className="w-full py-4 bg-[#043003] text-white font-bold rounded-xl hover:bg-[#064004] flex items-center justify-center gap-2"
                                  >
                                      <CheckCircle size={20}/> Verify & Confirm Delivery
                                  </button>
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full">
                          <Package size={48} className="text-gray-200 mb-4" />
                          <h3 className="text-xl font-bold text-gray-900">No active deliveries</h3>
                          <Link to="/marketplace" className="mt-6 px-8 py-3 bg-[#043003] text-white rounded-lg font-bold shadow-lg">Browse Marketplace</Link>
                      </div>
                  )}
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp size={20} className="text-emerald-500"/> Sourcing Insights
                  </h3>
                  <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={spendingHistory}>
                              <defs>
                                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                              <Tooltip />
                              <Area type="monotone" dataKey="spend" stroke="#10B981" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Daily Overview' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 animate-in fade-in">
              <h2 className="text-2xl font-bold mb-6">Business Overview - {dailyStats.date}</h2>
              <div className="grid grid-cols-3 gap-8">
                  <div className="p-6 bg-slate-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Daily Revenue</p>
                      <p className="text-3xl font-black">${dailyStats.revenue.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Total Covers</p>
                      <p className="text-3xl font-black">{dailyStats.covers}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Avg Spend/Cover</p>
                      <p className="text-3xl font-black">${dailyStats.avgPerCover}</p>
                  </div>
              </div>
          </div>
      )}

      <VerificationModal 
          isOpen={showVerification} 
          onClose={() => setShowVerification(false)}
          order={verifyingOrder}
          onComplete={() => { setShowVerification(false); setVerifyingOrder(null); alert("Verification Submitted"); }}
      />
    </div>
  );
};