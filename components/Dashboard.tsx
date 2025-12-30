
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, InventoryItem, Product, Driver, Packer, OrderItem, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { 
  Package, Truck, MapPin, AlertTriangle, LayoutDashboard, 
  Users, Clock, CheckCircle, X, UploadCloud, 
  DollarSign, Camera, Check, ChevronDown, Info, Search, Bell, Settings, Lock
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

/* HIGH FIDELITY PACKING LIST MODAL */
const PackingListModal: React.FC<{
    order: Order;
    onClose: () => void;
    onComplete: (packerId: string, driverId: string, photo: string) => void;
    drivers: Driver[];
    packers: Packer[];
}> = ({ order, onClose, onComplete, drivers, packers }) => {
    const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
    const [reportingItemId, setReportingItemId] = useState<string | null>(null);
    const [itemIssues, setItemIssues] = useState<Record<string, string>>({});
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedPacker, setSelectedPacker] = useState('');
    const [proofPhoto, setProofPhoto] = useState<string | null>(null);

    const packedCount = Object.values(packedItems).filter(Boolean).length;
    const totalItems = order.items.length;
    const progress = (packedCount / totalItems) * 100;

    const handleReportIssue = (productId: string, issue: string) => {
        if (!issue || issue === "Select issue type") return;
        
        setItemIssues(prev => ({ ...prev, [productId]: issue }));
        setReportingItemId(null);
        
        const product = mockService.getProduct(productId);
        const productName = product?.name || 'Unknown Item';
        
        mockService.addAppNotification('u1', 'Packing Issue Reported', `URGENT: Order #${order.id} - Issue reported for ${productName}: ${issue}`, 'SYSTEM', '/');
        mockService.addAppNotification(order.buyerId, 'Order Update', `Status update for Order #${order.id}: A packing issue has been reported for ${productName} (${issue}). Platform Zero is resolving this for you.`, 'ORDER', '/orders');
        setPackedItems(prev => ({ ...prev, [productId]: false }));
    };

    const togglePacked = (productId: string) => {
        setPackedItems(prev => ({...prev, [productId]: !prev[productId]}));
        if (itemIssues[productId]) {
            setItemIssues(prev => {
                const n = {...prev};
                delete n[productId];
                return n;
            });
        }
        if (reportingItemId === productId) {
            setReportingItemId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2.5 rounded-xl text-gray-700"><Package size={24}/></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Packing List - Order #{order.id.split('-')[1] || order.id}</h2>
                            <p className="text-sm text-gray-500 font-medium">Ordered on Dec 18, 2025</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={24}/></button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50/30 border-b border-gray-100 items-end">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-lg font-bold text-gray-900">{mockService.getCustomers().find(c => c.id === order.buyerId)?.contactName || 'Sarah Johnson'}</p>
                        <p className="text-sm text-gray-500">{mockService.getCustomers().find(c => c.id === order.buyerId)?.email || 'orders@freshmarket.com'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assign Packer</p>
                        <div className="relative">
                            <select 
                                value={selectedPacker}
                                onChange={e => setSelectedPacker(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 border border-emerald-400 rounded-xl font-bold bg-white text-sm text-black outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-sm"
                            >
                                <option value="" className="text-black">Select a registered packer...</option>
                                {packers.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
                            </select>
                            <Users size={18} className="absolute right-4 top-2.5 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Status</p>
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                            <Clock size={12}/> assigned
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">Items to Pack</h3>
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 text-center">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Quantity</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Issue Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items.map((item, idx) => {
                                    const product = mockService.getProduct(item.productId);
                                    const isPacked = packedItems[item.productId];
                                    const issue = itemIssues[item.productId];
                                    const isReporting = reportingItemId === item.productId;

                                    return (
                                        <tr key={idx} className="group hover:bg-gray-50/50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => togglePacked(item.productId)}
                                                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${isPacked ? 'bg-white border-gray-900 text-gray-900 shadow-sm' : 'border-gray-300 hover:border-gray-900 bg-white text-transparent'}`}
                                                    >
                                                        <Check size={20} strokeWidth={3}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => setReportingItemId(isReporting ? null : item.productId)}
                                                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${isReporting || issue ? 'bg-[#EF4444] border-[#EF4444] text-white shadow-md scale-105' : 'bg-white border-gray-300 hover:border-red-400 text-gray-400'}`}
                                                    >
                                                        <AlertTriangle size={18}/>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-gray-900">{product?.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{product?.category || 'Vegetable'}</p>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-gray-700 text-lg">{item.quantityKg}kg</td>
                                            <td className="px-4 py-4 text-right">
                                                {isReporting ? (
                                                    <div className="relative inline-block text-left animate-in slide-in-from-right-4">
                                                        <div className="relative flex items-center">
                                                            <select 
                                                                autoFocus
                                                                onChange={(e) => handleReportIssue(item.productId, e.target.value)}
                                                                onBlur={() => {
                                                                    setTimeout(() => setReportingItemId(null), 250);
                                                                }}
                                                                className="appearance-none text-sm px-4 py-2.5 border-2 border-red-200 rounded-xl bg-white font-bold outline-none ring-2 ring-red-50 text-black shadow-lg pr-10 min-w-[200px]"
                                                            >
                                                                <option className="text-black">Select issue type</option>
                                                                <option className="text-black" value="No Available Stock">No Available Stock</option>
                                                                <option className="text-black" value="Product Damaged">Product Damaged</option>
                                                                <option className="text-black" value="Product Expired">Product Expired</option>
                                                                <option className="text-black" value="Other Issue">Other Issue</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-3 text-gray-400 pointer-events-none" size={16}/>
                                                        </div>
                                                    </div>
                                                ) : issue ? (
                                                    <span className="text-red-500 font-black text-xs uppercase tracking-tight bg-red-50 px-3 py-1 rounded-full border border-red-100">{issue}</span>
                                                ) : null}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-[#EFF6FF] rounded-xl p-5 border border-[#DBEAFE]">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-[#1E40AF]">Packing Progress</h4>
                            <span className="text-xs font-bold text-[#1E40AF]">{packedCount} / {totalItems} items packed</span>
                        </div>
                        <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#BFDBFE]">
                            <div className="h-full bg-blue-500 transition-all duration-700 ease-out shadow-sm" style={{width: `${progress}%`}}></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Packing Verification Photo</h3>
                        <div 
                            onClick={() => setProofPhoto('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600')}
                            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden h-52 ${proofPhoto ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 hover:bg-gray-50 hover:border-blue-400'}`}
                        >
                            {proofPhoto ? (
                                <img src={proofPhoto} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="bg-gray-100 p-3 rounded-full mb-3 text-gray-400"><Camera size={24}/></div>
                                    <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        <UploadCloud size={18}/> Upload Packing Photo
                                    </button>
                                    <p className="text-xs text-gray-500 mt-4 font-medium">Take a photo of all packed items ready for truck loading</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Assign Truck Driver</label>
                        <div className="relative">
                            <Truck size={18} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none"/>
                            <select 
                                value={selectedDriver}
                                onChange={e => setSelectedDriver(e.target.value)}
                                className="w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-xl font-bold bg-white text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm"
                            >
                                <option value="" className="text-black">Select a driver for this delivery</option>
                                {drivers.map(d => <option key={d.id} value={d.id} className="text-black">{d.name} ({d.vehicleType})</option>)}
                                <option value="ext" className="text-black">3rd Party Logistics (Little Logistics)</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">Close</button>
                    <button 
                        onClick={() => onComplete(selectedPacker, selectedDriver, proofPhoto || '')}
                        disabled={packedCount + Object.keys(itemIssues).length < totalItems || !selectedDriver || !selectedPacker}
                        className="px-10 py-3 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-widest text-xs"
                    >
                        Packing completed
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Order Management');
  const [orderSubTab, setOrderSubTab] = useState('Pending Acceptance');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packers, setPackers] = useState<Packer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // UI / Modal States
  const [packingOrder, setPackingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allOrders);
    setInventory(mockService.getInventory(user.id));
    setProducts(mockService.getAllProducts());
    setDrivers(mockService.getDrivers(user.id));
    setPackers(mockService.getPackers(user.id));
    setCustomers(mockService.getCustomers());
  };

  const isProfileComplete = user.businessProfile?.isComplete || false;

  const handleAcceptOrder = (order: Order) => {
    // ENFORCED RULE: Cannot accept orders until profile documents are complete
    if (!isProfileComplete) {
        alert("Action Required: Please go to Settings and complete your onboarding documents (NDA, Logistics, and T&Cs) before you can accept marketplace orders.");
        return;
    }
    
    mockService.acceptOrderV2(order.id);
    loadData();
    alert("Order Accepted! Platform Zero Admin and the customer have been notified.");
  };

  const handleRejectOrder = (order: Order) => {
      if(confirm(`Are you sure you want to reject this order?`)) {
          alert("Order Rejected.");
      }
  };

  const handleCompletePacking = (packerId: string, driverId: string, photo: string) => {
    if (!packingOrder) return;
    const packerName = packers.find(p => p.id === packerId)?.name || 'Internal Team';
    const driverName = drivers.find(d => d.id === driverId)?.name || 'Logistics Partner';
    
    mockService.packOrder(packingOrder.id, packerName, driverId, driverName);
    setPackingOrder(null);
    loadData();
    alert(`Order #${packingOrder.id.split('-')[1]} is fully packed and ready!`);
  };

  const pendingAcceptance = orders.filter(o => o.status === 'Pending');
  const acceptedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready for Delivery' || o.status === 'Shipped');
  const fulfilledOrders = orders.filter(o => o.status === 'Delivered');
  const expiredOrders = orders.filter(o => o.status === 'Cancelled');

  const displayedOrders = 
    orderSubTab === 'Pending Acceptance' ? pendingAcceptance :
    orderSubTab === 'Accepted' ? acceptedOrders :
    orderSubTab === 'Fulfilled' ? fulfilledOrders : expiredOrders;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Partner Operations</h1>
            <p className="text-gray-500 mt-1 text-base md:text-lg">Manage orders, logistics, and network.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-xl text-blue-600 font-bold text-xs md:text-sm hover:bg-blue-50 shadow-sm transition-all whitespace-nowrap">
                <Truck size={16}/> Driver Logistics
            </button>
        </div>
      </div>

      {/* ONBOARDING WARNING BANNER - COMPACTED */}
      {!isProfileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top-4">
              <div className="bg-white p-3 rounded-xl text-amber-600 shadow-sm border border-amber-100 hidden md:block">
                  <AlertTriangle size={24} />
              </div>
              <div className="flex-1 text-center md:text-left">
                  <h2 className="text-sm md:text-base font-black text-amber-900 uppercase tracking-tight">Onboarding Documents Pending</h2>
                  <p className="text-amber-800 text-xs md:text-sm font-medium mt-0.5">Please complete your business profile in settings to unlock full marketplace fulfillment.</p>
              </div>
              <button 
                onClick={() => setActiveTab('Settings')}
                className="w-full md:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-md hover:bg-amber-700 transition-all whitespace-nowrap"
              >
                  Complete Setup
              </button>
          </div>
      )}

      {/* Tabs Row */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
            { name: 'Order Management', icon: LayoutDashboard },
            { name: 'Sell', icon: Package },
            { name: 'Customers', icon: Users },
            { name: 'Settings', icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.name 
                ? 'bg-[#0F172A] text-white shadow-lg' 
                : 'text-[#64748B] hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'Order Management' && (
        <div className="space-y-6">
          
          {/* URGENT RED BANNER - NEAT & TIDY */}
          {pendingAcceptance.length > 0 && (
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-4 md:p-6 space-y-4 animate-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-lg shadow-sm text-red-600 border border-red-100">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-black text-[#991B1B] uppercase tracking-tight">Orders Awaiting Acceptance</h2>
                  <p className="text-[#B91C1C] text-xs md:text-sm font-semibold">{pendingAcceptance.length} orders need acceptance within 60 minutes</p>
                </div>
              </div>

              <div className="space-y-2">
                {pendingAcceptance.map(order => {
                  const customer = mockService.getCustomers().find(c => c.id === order.buyerId);
                  return (
                    <div key={order.id} className="bg-white rounded-xl p-3 md:p-4 border border-red-100 shadow-sm flex justify-between items-center hover:border-red-300 transition-all group cursor-pointer" onClick={() => setPackingOrder(order)}>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-black text-gray-900 tracking-tight truncate">{customer?.businessName || 'Fresh Market Co'}</h4>
                        <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">#{order.id.split('-')[1] || '1001'} • ${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end ml-4">
                        <div className="flex items-center gap-1.5 text-red-600 font-black text-xs">
                          <Clock size={14} className="animate-pulse" />
                          <span>30m left</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-red-400 tracking-widest mt-1 hidden sm:block">URGENT</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setOrderSubTab('Pending Acceptance')}
                className="w-full py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black rounded-xl shadow-md transition-all uppercase tracking-widest text-[10px]"
              >
                View All Pending
              </button>
            </div>
          )}

          {/* MAIN WORKSPACE - REFACTORED TO BE NEATER */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Order Queue</h2>
                    <p className="text-gray-500 font-medium text-xs md:text-sm mt-0.5">Assigned by Platform Zero Marketplace.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="hidden lg:flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Updates
                    </div>
                </div>
              </div>

              {/* Sub-Tabs - NEATER */}
              <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
                  {['Pending Acceptance', 'Accepted', 'Fulfilled'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setOrderSubTab(t)}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${orderSubTab === t ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                          {t.split(' ')[0]}
                          {t === 'Pending Acceptance' && pendingAcceptance.length > 0 && <span className="bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{pendingAcceptance.length}</span>}
                          {t === 'Accepted' && acceptedOrders.length > 0 && <span className="bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{acceptedOrders.length}</span>}
                      </button>
                  ))}
              </div>

              {/* REFACTORED COMPACT CARDS */}
              <div className="space-y-4">
                {displayedOrders.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center">
                        <div className="bg-gray-50 p-4 rounded-full text-gray-200 mb-4"><CheckCircle size={40}/></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No orders currently</p>
                    </div>
                ) : displayedOrders.map(order => {
                    const customer = mockService.getCustomers().find(c => c.id === order.buyerId);
                    const isAccepted = order.status !== 'Pending';

                    return (
                        <div 
                            key={order.id} 
                            className="bg-[#FFFDF6] rounded-2xl border border-[#FDE68A] p-4 md:p-6 shadow-sm hover:border-[#FBBF24] transition-all relative group animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-base md:text-lg font-black text-[#1E293B] tracking-tight truncate">{customer?.businessName || 'Healthy Eats Restaurant'}</h3>
                                        {order.priority && (
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${order.priority === 'URGENT' ? 'bg-[#EF4444] text-white' : 'bg-[#EA580C] text-white'}`}>
                                                {order.priority}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-[#B45309]/60 font-black uppercase tracking-widest">ORDER #{order.id.split('-')[1] || '1002'}</p>
                                    
                                    <div className="mt-4 flex flex-wrap gap-4 md:gap-8">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Amount</p>
                                            <p className="text-sm md:text-base font-black text-[#1E293B]">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Qty</p>
                                            <p className="text-sm md:text-base font-black text-[#1E293B]">{order.items.length} skus</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Delivery</p>
                                            <p className="text-sm md:text-base font-black text-[#1E293B]">Dec 18</p>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE - ACTIONS & STATUS */}
                                <div className="w-full md:w-auto flex flex-col md:items-end justify-between min-h-[80px] md:border-l border-[#FEF3C7] md:pl-8">
                                    <div className="text-left md:text-right mb-4 md:mb-0 flex md:flex-col items-center md:items-end gap-2 md:gap-0">
                                        <p className="text-2xl md:text-3xl font-black text-[#B45309] tracking-tighter">30 min</p>
                                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Fulfillment Window</p>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button 
                                            onClick={() => setPackingOrder(order)}
                                            className="p-2.5 md:p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-all hover:bg-gray-50 flex items-center justify-center"
                                            title="Order Details"
                                        >
                                            <Search size={16}/>
                                        </button>

                                        {!isAccepted && (
                                            <button 
                                                onClick={() => handleRejectOrder(order)}
                                                className="flex-1 md:flex-none px-4 py-2.5 md:py-3 bg-white border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all whitespace-nowrap"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        
                                        <button 
                                            onClick={() => isAccepted ? setPackingOrder(order) : handleAcceptOrder(order)}
                                            disabled={!isAccepted && !isProfileComplete}
                                            className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all text-white flex items-center justify-center gap-2 whitespace-nowrap ${
                                                !isAccepted && !isProfileComplete ? 'bg-gray-300 cursor-not-allowed shadow-none' :
                                                isAccepted ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#22C55E] hover:bg-[#16A34A]'
                                            }`}
                                        >
                                            {!isAccepted && !isProfileComplete ? (
                                                <><Lock size={12}/> Setup Required</>
                                            ) : (
                                                isAccepted ? 'Start Packing' : 'Accept Order'
                                            )}
                                        </button>
                                    </div>
                                    
                                    {!isAccepted && !isProfileComplete && (
                                        <p className="text-[8px] text-red-500 font-bold uppercase text-center mt-1.5 md:w-full block">Sign Docs to Unlock</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
          </div>
        </div>
      )}

      {/* SELL TAB - RAPID AI CAPTURE & MATCHING */}
      {activeTab === 'Sell' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AiOpportunityMatcher user={user} />
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'Customers' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Connected Network</h2>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Manage your relationships and set custom pricing tiers.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {customers.filter(c => c.connectedSupplierId === user.id).map(customer => (
                    <div key={customer.id} className="p-6 border border-gray-200 rounded-3xl hover:shadow-lg transition-all bg-white relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users size={64} className="text-indigo-600"/>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black text-xl">
                            {customer.businessName.charAt(0)}
                        </div>
                        <h3 className="font-black text-gray-900 text-lg md:text-xl tracking-tight mb-1">{customer.businessName}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{customer.category}</p>
                        
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin size={14} className="text-gray-400"/> {customer.location || 'Melbourne, VIC'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                                <DollarSign size={14} className="text-emerald-500"/> Tier: Premium Wholesale
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Details</button>
                            <button className="flex-1 py-2.5 bg-[#0F172A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Set Price</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'Settings' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm animate-in fade-in duration-500">
            <SettingsComponent user={user} onRefreshUser={loadData} />
          </div>
      )}

      {/* PACKING STATION MODAL */}
      {packingOrder && (
          <PackingListModal 
              order={packingOrder} 
              onClose={() => setPackingOrder(null)} 
              onComplete={handleCompletePacking}
              drivers={drivers}
              packers={packers}
          />
      )}
    </div>
  );
};
