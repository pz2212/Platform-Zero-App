
// ... existing imports ...
import React, { useState, useEffect, useRef } from 'react';
import { User, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  TrendingUp, DollarSign, Calendar, AlertCircle, ArrowRight, FileText, 
  ShoppingBag, X, MapPin, Store, CheckCircle, Upload, Loader2, Link as LinkIcon, 
  Truck, Package, Clock, CheckSquare, Square, AlertTriangle, Download, 
  PieChart, Leaf, Camera, ChevronDown, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend 
} from 'recharts';

interface ConsumerDashboardProps {
  user: User;
}

// ... existing IssueReportModal ...
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
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Photo Evidence (max 3 photos)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                            <Camera size={32} className="mb-2"/>
                            <p className="text-sm font-medium text-center">Click to upload photos or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
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
                        Submit Issue Report
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... existing VerificationModal ...
const VerificationModal = ({ isOpen, onClose, order, onComplete }: any) => {
    const [timeLeft, setTimeLeft] = useState<number>(3600); // 1 hour in seconds
    const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({});
    const [issueModalItem, setIssueModalItem] = useState<string | null>(null);
    const [reportedItems, setReportedItems] = useState<Record<string, {type: string, action: string}>>({});

    useEffect(() => {
        if (!isOpen || !order) return;

        // Calculate time remaining based on delivery time
        const deliveredTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : Date.now();
        const deadline = deliveredTime + 60 * 60 * 1000; // 1 hour later

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
            setTimeLeft(remaining);
            
            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleVerify = (itemId: string) => {
        setVerifiedItems(prev => ({...prev, [itemId]: !prev[itemId]}));
        // Remove from reported if it was reported
        setReportedItems(prev => {
            const newState = {...prev};
            delete newState[itemId];
            return newState;
        });
    };

    const handleIssueSubmit = (details: {type: string, action: string}) => {
        if (issueModalItem) {
            setReportedItems(prev => ({...prev, [issueModalItem]: details}));
            // Unverify if it was verified
            setVerifiedItems(prev => {
                const newState = {...prev};
                delete newState[issueModalItem];
                return newState;
            });
            setIssueModalItem(null);
        }
    };

    const handleComplete = () => {
        // Collect all issues into an array
        const issues = Object.entries(reportedItems).map(([itemId, details]) => {
            const d = details as { type: string; action: string };
            return {
                itemId,
                type: d.type,
                action: d.action
            };
        });

        // Call Service
        mockService.verifyOrder(order.id, issues);
        onComplete();
    };

    const isTimeUp = timeLeft === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Delivery Verification - Order #{order.id.split('-')[1] || order.id}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>

                {/* Timer Alert */}
                <div className={`px-6 py-4 flex items-center gap-3 ${isTimeUp ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-700'}`}>
                    {isTimeUp ? <Clock size={20}/> : <Clock size={20} className="animate-pulse"/>}
                    <div className="flex-1">
                        <p className="font-bold text-sm">
                            {isTimeUp ? 'Verification Period Ended' : `Verification Timer: ${formatTime(timeLeft)} remaining`}
                        </p>
                        <p className="text-xs opacity-90">
                            {isTimeUp 
                                ? 'The 1-hour window has passed. Invoice is locked.' 
                                : 'Please verify all items within 60 minutes to report any issues.'}
                        </p>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <h3 className="font-bold text-gray-900 mb-4">Product Checklist</h3>
                    <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => {
                            const product = mockService.getProduct(item.productId);
                            const isVerified = verifiedItems[item.productId];
                            const isReported = reportedItems[item.productId];

                            return (
                                <div key={idx} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{product?.name}</h4>
                                        <p className="text-sm text-gray-500">Ordered: {item.quantityKg}kg | Price: ${item.pricePerKg.toFixed(2)}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {isReported ? (
                                            <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg text-sm flex items-center gap-2 border border-red-200">
                                                <AlertTriangle size={16}/> Issue Reported
                                            </span>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => handleVerify(item.productId)}
                                                    disabled={isTimeUp}
                                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                                                        isVerified 
                                                        ? 'bg-green-600 text-white shadow-sm' 
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    } ${isTimeUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {isVerified ? (
                                                        <>Verified <Check size={16}/></>
                                                    ) : (
                                                        <>
                                                            <div className={`w-4 h-4 rounded border ${isVerified ? 'bg-white border-transparent' : 'border-gray-400'}`}></div> Verify
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => setIssueModalItem(item.productId)}
                                                    disabled={isTimeUp}
                                                    className={`px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 flex items-center gap-2 shadow-sm ${isTimeUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <AlertTriangle size={16}/> Issue
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-[#043003] text-white">
                    <button 
                        onClick={handleComplete}
                        className="w-full py-3 bg-[#043003] text-white rounded-lg font-bold hover:bg-[#064004] transition-colors text-lg disabled:opacity-70 border border-white/20"
                        disabled={!isTimeUp && Object.keys(verifiedItems).length + Object.keys(reportedItems).length < order.items.length}
                    >
                        {isTimeUp ? 'Close (Locked)' : 'Complete Order Checklist'}
                    </button>
                </div>

                {/* Nested Issue Modal */}
                <IssueReportModal 
                    isOpen={!!issueModalItem} 
                    onClose={() => setIssueModalItem(null)}
                    itemName={mockService.getProduct(issueModalItem!)?.name}
                    onSubmit={handleIssueSubmit}
                />
            </div>
        </div>
    );
};

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Recent Orders'); 
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [liveTimer, setLiveTimer] = useState<string>('59:59');

  // Deli Integration State
  const [deliItem, setDeliItem] = useState({ name: '', price: '', quantity: '', description: '' });
  const [isDeliSubmitting, setIsDeliSubmitting] = useState(false);

  useEffect(() => {
    // Fetch orders for the current user (Buyer)
    // Poll to keep UI in sync for demo purposes
    const fetchOrders = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setAllOrders(userOrders);
        
        // Filter for orders in the past week (7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recent = userOrders.filter(o => new Date(o.date) >= sevenDaysAgo);
        
        // Sort by date descending (newest first)
        const sorted = recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentOrders(sorted);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000); // Polling for demo reactivity
    return () => clearInterval(interval);
  }, [user]);

  // Live Timer Update Effect
  useEffect(() => {
      const activeOrder = recentOrders.find(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status));
      if (activeOrder && activeOrder.status === 'Delivered' && activeOrder.deliveredAt) {
          const deadline = new Date(activeOrder.deliveredAt).getTime() + 60 * 60 * 1000;
          const interval = setInterval(() => {
              const now = Date.now();
              const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
              const m = Math.floor(remaining / 60);
              const s = remaining % 60;
              setLiveTimer(`${m}:${s.toString().padStart(2, '0')}`);
              
              if (remaining <= 0) clearInterval(interval);
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [recentOrders]);

  // ... (keep dailyStats, spendCategories, etc. unchanged)
  // Mock Data matching the user's requirement for Daily Overview
  const dailyStats = {
    revenue: 2847.50,
    covers: 127,
    avgPerCover: 22.42,
    date: new Date().toLocaleDateString() // Dynamic date
  };

  const spendCategories = [
    { name: 'Fruits & Vegetables', supplier: 'Platform Zero', amount: 485.30, items: [
        { name: 'Fresh Vegetables', cost: 245.60 },
        { name: 'Seasonal Fruits', cost: 178.90 },
        { name: 'Herbs & Leafy Greens', cost: 60.80 }
    ]},
    { name: 'Seafood', supplier: 'Ocean Fresh', amount: 456.80, items: [
        { name: 'Fresh Fish Daily', cost: 267.90 },
        { name: 'Premium Shellfish', cost: 134.50 },
        { name: 'Specialty Seafood', cost: 54.40 }
    ]}
  ];

  // --- CHART MOCK DATA ---
  const spendingHistory = [
    { month: 'Jan', spend: 4200, market: 5250 },
    { month: 'Feb', spend: 3800, market: 4750 },
    { month: 'Mar', spend: 5100, market: 6375 },
    { month: 'Apr', spend: 4800, market: 6000 },
    { month: 'May', spend: 5400, market: 6750 },
    { month: 'Jun', spend: 6100, market: 7625 },
  ];

  const impactHistory = [
    { month: 'Jan', co2: 120, waste: 45 },
    { month: 'Feb', co2: 98, waste: 38 },
    { month: 'Mar', co2: 145, waste: 55 },
    { month: 'Apr', co2: 130, waste: 48 },
    { month: 'May', co2: 160, waste: 62 },
    { month: 'Jun', co2: 185, waste: 75 },
  ];

  const categoryData = [
    { name: 'Vegetables', value: 45, color: '#10B981' }, // Emerald 500
    { name: 'Fruit', value: 30, color: '#F59E0B' },     // Amber 500
    { name: 'Seafood', value: 15, color: '#3B82F6' },    // Blue 500
    { name: 'Dry Goods', value: 10, color: '#6366F1' },  // Indigo 500
  ];

  const handleDownloadInvoice = (order: Order) => {
      const invoiceContent = `
PLATFORM ZERO - TAX INVOICE
------------------------------------------------
Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.status}

BILLED TO:
${user.businessName}
${user.email}

------------------------------------------------
ITEMS:
${order.items.map(i => {
    const product = mockService.getProduct(i.productId);
    return `- ${product?.name || 'Item'} (${i.quantityKg}kg @ $${i.pricePerKg.toFixed(2)}/kg): $${(i.quantityKg * i.pricePerKg).toFixed(2)}`;
}).join('\n')}

------------------------------------------------
TOTAL: $${order.totalAmount.toFixed(2)}
------------------------------------------------
Thank you for your business.
      `;

      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${order.id}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  const handleListOnDeli = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeliSubmitting(true);
    setTimeout(() => {
        setIsDeliSubmitting(false);
        alert(`Successfully listed ${deliItem.name} on The Deli App via API connection!`);
        setDeliItem({ name: '', price: '', quantity: '', description: '' });
    }, 1500);
  };

  // Find the most relevant active order
  // Priority: Delivered > In Transit > Ready > Confirmed > Pending
  // Sort so we show the furthest progressed one or most actionable one
  const activeOrder = recentOrders.filter(o => 
      ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status)
  ).sort((a, b) => {
      // Prioritize Delivered within 1 hour
      if (a.status === 'Delivered' && !b.status.startsWith('D')) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
  })[0];

  // Determine if active order requires verification (Delivered and within 1 hour window)
  const deliveryTime = activeOrder?.deliveredAt ? new Date(activeOrder.deliveredAt).getTime() : (activeOrder ? Date.now() : 0);
  const timeSinceDelivery = Date.now() - deliveryTime;
  const isLocked = timeSinceDelivery > 60 * 60 * 1000; // 1 hour

  // Progress logic
  // 'Ready for Delivery' means 'Order Prepared' step is done.
  const isPrepared = activeOrder ? ['Ready for Delivery', 'Shipped', 'Delivered'].includes(activeOrder.status) : false;
  const isShipped = activeOrder ? ['Shipped', 'Delivered'].includes(activeOrder.status) : false;
  const isDelivered = activeOrder ? activeOrder.status === 'Delivered' : false;

  const steps = [
      { status: 'Confirmed', label: 'Order Confirmed', time: '10:30 AM', sub: 'Green Valley Farms', done: true },
      { status: 'Prepared', label: 'Order Prepared', time: activeOrder?.packedAt ? new Date(activeOrder.packedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '1:15 PM', sub: 'Quality checked and packed', done: isPrepared },
      { status: 'Out for Delivery', label: 'Out for Delivery', time: '2:00 PM', sub: 'Driver en route', done: isShipped },
      { status: 'Delivered', label: 'Delivered', time: '2:28 PM', sub: 'Driver confirmed delivery', done: isDelivered }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ... Header Stats & Tabs (unchanged) ... */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-500">Monthly Spend</p>
                <DollarSign size={20} className="text-emerald-500"/>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">$10,247</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                <FileText size={20} className="text-orange-500"/>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">2</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-500">Overdue Payments</p>
                <AlertCircle size={20} className="text-red-500"/>
            </div>
            <h3 className="text-3xl font-bold text-red-600">2</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <ShoppingBag size={20} className="text-blue-500"/>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 text-blue-600">{recentOrders.filter(o => o.status !== 'Delivered').length}</h3>
        </div>
      </div>

      <div className="bg-gray-100/50 p-1 rounded-lg inline-flex w-full border border-gray-200 overflow-x-auto">
          {['Recent Orders', 'Daily Overview', 'Open Invoices', 'Payment Due', 'Buying Analysis'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-fit px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {/* --- RECENT ORDERS TAB (Updated with Tracking UI) --- */}
      {activeTab === 'Recent Orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
              {/* LEFT HALF: Live Order Tracking Card */}
              <div className="flex flex-col">
                  {activeOrder ? (
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full animate-in slide-in-from-left-4 duration-500">
                          {/* Header */}
                          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                              <div>
                                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Live Order Tracking</h2>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                          </div>

                          <div className="p-6 flex-1 space-y-8">
                              {/* Driver Info Box */}
                              <div className="bg-[#EFF6FF] rounded-xl p-4 flex justify-between items-center border border-blue-100">
                                  <div>
                                      <p className="font-bold text-gray-900 text-lg mb-1">Order #{activeOrder.id.split('-')[1] || activeOrder.id}</p>
                                      <p className="text-sm text-gray-600">Driver: {activeOrder.logistics?.driverName || 'Finding Driver'}</p>
                                      <p className="text-sm text-gray-600">ETA: {activeOrder.logistics?.deliveryTime || 'TBD'}</p>
                                      <p className="text-xs text-gray-500 mt-1">Vehicle: White Toyota Hiace - Plate ABC123</p>
                                  </div>
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${activeOrder.status === 'Delivered' ? 'bg-[#043003] text-white' : 'bg-blue-600 text-white'}`}>
                                      {activeOrder.status === 'Delivered' ? 'Delivered' : activeOrder.status === 'Ready for Delivery' ? 'Packing Complete' : 'In Transit'}
                                  </span>
                              </div>

                              {/* Timeline */}
                              <div className="relative space-y-8 pl-4 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                  {steps.map((step, idx) => (
                                      <div key={idx} className="relative flex items-start gap-4">
                                          <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                                              step.done 
                                              ? 'border-emerald-500 text-emerald-500' 
                                              : idx === 2 && isShipped ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-300'
                                          }`}>
                                              {step.status === 'Out for Delivery' && !step.done && isPrepared ? <Truck size={12} fill="currentColor" className="text-gray-400"/> : <CheckCircle size={14} className={step.done ? "fill-emerald-100" : "text-gray-300"}/>}
                                          </div>
                                          <div className="-mt-1">
                                              <p className={`font-bold text-sm ${step.done ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                                              <p className="text-xs text-gray-500">{step.time} - {step.sub}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              {/* Instructions */}
                              <div className="bg-[#FFFBEB] p-4 rounded-xl border border-[#FEF3C7]">
                                  <p className="font-bold text-[#92400E] text-sm mb-1">Delivery Instructions</p>
                                  <p className="text-xs text-[#92400E]">{activeOrder.logistics?.deliveryLocation || 'Please deliver to rear kitchen entrance. Ring bell twice.'}</p>
                              </div>

                              {/* Verification Status Area */}
                              {activeOrder.status === 'Delivered' && (
                                  <div className={`rounded-xl p-4 border ${isLocked ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
                                      <div className="flex items-start gap-3">
                                          <CheckCircle className={`mt-0.5 ${isLocked ? 'text-gray-400' : 'text-green-600'}`} size={20}/>
                                          <div>
                                              <p className={`font-bold text-sm ${isLocked ? 'text-gray-700' : 'text-green-800'}`}>
                                                  Delivery Confirmed by Driver
                                              </p>
                                              <p className={`text-xs mt-1 leading-relaxed ${isLocked ? 'text-gray-500' : 'text-green-700'}`}>
                                                  {activeOrder.logistics?.driverName} confirmed delivery at {activeOrder.logistics?.deliveryTime}. Verification countdown started automatically.
                                              </p>
                                          </div>
                                      </div>
                                      
                                      <button 
                                          onClick={() => { setVerifyingOrder(activeOrder); setShowVerification(true); }}
                                          className={`w-full mt-4 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                                              isLocked 
                                              ? 'bg-gray-800 cursor-not-allowed' 
                                              : 'bg-[#043003] hover:bg-[#064004]'
                                          }`}
                                      >
                                          {isLocked ? (
                                              <span>Invoice Locked (Time Expired)</span>
                                          ) : (
                                              <>
                                                  <Clock size={18}/> Verify Products ({liveTimer} remaining)
                                              </>
                                          )}
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex-1 flex flex-col items-center justify-center text-center h-full">
                          <div className="bg-gray-50 p-4 rounded-full mb-4">
                              <CheckCircle size={48} className="text-gray-300"/>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">No active deliveries</h3>
                          <p className="text-gray-500 mt-2 max-w-xs">You're all caught up! New orders will appear here in real-time.</p>
                          <Link to="/marketplace" className="mt-6 px-6 py-3 bg-[#043003] text-white rounded-lg font-bold hover:bg-[#064004] transition-colors flex items-center gap-2">
                              <ShoppingBag size={18}/> Place New Order
                          </Link>
                      </div>
                  )}
              </div>

              {/* RIGHT HALF: SELL ON THE DELI (Integration) */}
              <div className="flex flex-col">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                          <Store size={20} className="text-indigo-600"/> Sell on The Deli
                      </h3>
                      <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                          <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600 relative">
                              <LinkIcon size={20} />
                              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                          </div>
                          <div>
                              <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                                API Connected <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Live</span>
                              </h4>
                              <p className="text-indigo-700 text-xs mt-1">
                                  Products listed here are instantly synced via API to your <strong>The Deli App</strong> storefront.
                              </p>
                          </div>
                      </div>

                      <form onSubmit={handleListOnDeli} className="space-y-4 flex-1 flex flex-col">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                              <input 
                                  required
                                  type="text" 
                                  placeholder="e.g. Daily Special: Lasagna"
                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                                  value={deliItem.name}
                                  onChange={e => setDeliItem({...deliItem, name: e.target.value})}
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price ($)</label>
                                  <input 
                                      required
                                      type="number" 
                                      placeholder="12.50"
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                                      value={deliItem.price}
                                      onChange={e => setDeliItem({...deliItem, price: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                                  <input 
                                      required
                                      type="number" 
                                      placeholder="10"
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                                      value={deliItem.quantity}
                                      onChange={e => setDeliItem({...deliItem, quantity: e.target.value})}
                                  />
                              </div>
                          </div>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                              <textarea 
                                  placeholder="Ingredients, allergens, heating instructions..."
                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium h-32 resize-none"
                                  value={deliItem.description}
                                  onChange={e => setDeliItem({...deliItem, description: e.target.value})}
                              />
                          </div>
                          
                          <button 
                              type="submit"
                              disabled={isDeliSubmitting}
                              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 mt-auto"
                          >
                              {isDeliSubmitting ? (
                                  <>
                                      <Loader2 size={18} className="animate-spin"/> Uploading via API...
                                  </> 
                              ) : (
                                  <>
                                      <Upload size={18} /> Upload to Deli
                                  </>
                              )}
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      )}

      {/* ... other tabs ... */}
      {/* ... modals ... */}
      <VerificationModal 
          isOpen={showVerification} 
          onClose={() => setShowVerification(false)}
          order={verifyingOrder}
          onComplete={() => { setShowVerification(false); setVerifyingOrder(null); alert("Verification Complete. Invoice Confirmed."); }}
      />

      {/* INVOICE / ORDER DETAILS MODAL (Fallback/General View) */}
      {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
                      <div>
                          <div className="flex items-center gap-3 mb-1">
                              <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
                              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-gray-100 text-gray-700">
                                  {selectedOrder.status}
                              </span>
                          </div>
                          <p className="text-sm text-gray-500">Order ID: {selectedOrder.id}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="p-8 space-y-8 bg-white">
                      <div className="flex justify-between">
                          <div>
                              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Delivery To</h3>
                              <p className="font-bold text-lg text-gray-900">{user.businessName}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                  <MapPin size={14}/> {selectedOrder.logistics?.deliveryLocation || user.location || 'Main Location'}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">Ordered By: {user.name}</p>
                          </div>
                          <div className="text-right">
                              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Delivery Time</h3>
                              <p className="font-bold text-lg text-gray-900">
                                {selectedOrder.logistics?.deliveryTime || 'TBD'}
                              </p>
                              <div className="mt-2 text-sm text-gray-500">
                                  Expected: {selectedOrder.logistics?.deliveryDate ? new Date(selectedOrder.logistics.deliveryDate).toLocaleDateString() : 'Pending'}
                              </div>
                          </div>
                      </div>

                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="border-b-2 border-gray-100">
                                  <th className="py-3 text-sm font-bold text-gray-900 uppercase">Item</th>
                                  <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right">Qty</th>
                                  <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right">Price</th>
                                  <th className="py-3 text-sm font-bold text-gray-900 uppercase text-right">Total</th>
                              </tr>
                          </thead>
                          <tbody>
                              {selectedOrder.items.map((item, idx) => {
                                  const product = mockService.getProduct(item.productId);
                                  return (
                                      <tr key={idx} className="border-b border-gray-50 last:border-0">
                                          <td className="py-4">
                                              <div className="font-medium text-gray-900">{product?.name || 'Unknown Item'}</div>
                                              <div className="text-xs text-gray-500">{product?.variety}</div>
                                          </td>
                                          <td className="py-4 text-right">{item.quantityKg} kg</td>
                                          <td className="py-4 text-right">${item.pricePerKg.toFixed(2)}</td>
                                          <td className="py-4 text-right font-medium">${(item.quantityKg * item.pricePerKg).toFixed(2)}</td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>

                      <div className="flex justify-between items-start pt-4 border-t border-gray-100">
                          <div className="w-1/3 space-y-3 ml-auto">
                              <div className="flex justify-between text-gray-600 text-sm">
                                  <span>Subtotal</span>
                                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600 text-sm">
                                  <span>GST (10%)</span>
                                  <span>${(selectedOrder.totalAmount * 0.1).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                                  <span>Total Paid</span>
                                  <span>${(selectedOrder.totalAmount * 1.1).toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center mt-auto">
                      <button 
                          onClick={() => handleDownloadInvoice(selectedOrder)}
                          className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
                      >
                          <Download size={16}/> Download PDF
                      </button>
                      
                      <button 
                          onClick={() => setSelectedOrder(null)}
                          className="px-6 py-2 bg-[#043003] text-white rounded-lg font-bold hover:bg-[#064004] shadow-sm"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
