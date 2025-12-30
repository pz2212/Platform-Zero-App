
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Lead, InventoryItem, Product, SupplierPriceRequest, SupplierPriceRequestItem, Driver, Packer, Customer, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { identifyProductFromImage } from '../services/geminiService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { ChatDialog } from './ChatDialog';
import { SellProductDialog } from './SellProductDialog';
import { 
  Briefcase, Package, Users, ClipboardList, Camera, 
  CheckCircle, MapPin, AlertTriangle, 
  Send, Loader2, X, ChevronRight,
  Target, TrendingUp, Plus, Edit2, ShoppingBag, GitPullRequest, Bell, Store, MoreVertical, Heart, Tag, DollarSign, Phone, Activity, Clock, Truck, Box, CheckSquare, Search, Zap, ArrowRight, UploadCloud, Share2, Smartphone, Contact, Check, UserPlus, BookOpen
} from 'lucide-react';

interface SellerDashboardV1Props {
  user: User;
  onLogout?: () => void;
  onSwitchVersion?: (version: 'v1' | 'v2') => void;
}

export const ShareModal: React.FC<{
  item: InventoryItem;
  onClose: () => void;
  onComplete: () => void;
  currentUser: User;
}> = ({ item, onClose, onComplete, currentUser }) => {
  const product = mockService.getProduct(item.productId);
  const owner = mockService.getAllUsers().find(u => u.id === item.ownerId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState<string[]>([]);
  const [currentManualNumber, setCurrentManualNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);

  useEffect(() => {
    const myCustomers = mockService.getCustomers().filter(c => c.connectedSupplierId === currentUser.id);
    setCustomers(myCustomers);
    setSelectedCustomerIds(myCustomers.map(c => c.id));
  }, [currentUser.id]);

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addManualNumber = () => {
    if (currentManualNumber) {
      const cleaned = currentManualNumber.replace(/[^\d+]/g, '');
      if (cleaned.length < 8) {
        alert("Please enter a valid mobile number.");
        return;
      }
      if (!manualNumbers.includes(cleaned)) {
        setManualNumbers([...manualNumbers, cleaned]);
      }
      setCurrentManualNumber('');
    }
  };

  const handleConnectContacts = async () => {
    try {
      setIsSyncingContacts(true);
      // @ts-ignore - Contact Picker API (Supported on Chrome Android, some iOS)
      if ('contacts' in navigator && 'select' in navigator.contacts) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        // @ts-ignore
        const contacts = await navigator.contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          const numbers = contacts.map((c: any) => c.tel?.[0]?.replace(/[^\d+]/g, '')).filter((t: any) => !!t);
          setManualNumbers(prev => [...new Set([...prev, ...numbers])]);
        }
      } else {
        // Fallback simulated sync for standard browser testing
        await new Promise(r => setTimeout(r, 1000));
        const mockContacts = ['0411222333', '0499888777', '0455123987'];
        setManualNumbers(prev => [...new Set([...prev, ...mockContacts])]);
        alert("📱 Device contacts synced successfully!");
      }
    } catch (err) {
      console.error("Contact sync error:", err);
    } finally {
      setIsSyncingContacts(false);
    }
  };

  const removeManualNumber = (num: string) => {
    setManualNumbers(manualNumbers.filter(n => n !== num));
  };

  const handleSendBlast = () => {
    // Collect all unique numbers (customers + manual)
    const targetNumbers = [
      ...customers.filter(c => selectedCustomerIds.includes(c.id)).map(c => c.phone).filter(p => !!p),
      ...manualNumbers
    ];

    if (targetNumbers.length === 0) {
      alert("Please select or add at least one mobile number to send the link.");
      return;
    }

    setIsSending(true);
    
    // 1. Generate the Deep Link
    // When receivers click this, they'll see the landing page and be asked to sign in/up to see product details
    const productLink = generateProductDeepLink('product', item.id, currentUser.id);
    
    // 2. Construct the SMS Template
    const businessName = owner?.businessName || currentUser.businessName;
    const productName = product?.name || 'fresh produce';
    const priceDisplay = product?.defaultPricePerKg ? `$${product.defaultPricePerKg.toFixed(2)}/kg` : 'market rates';
    
    const smsMessage = `Hi! ${businessName} just listed fresh ${productName} on Platform Zero! 🔥 Price: ${priceDisplay}. View product and trade here: ${productLink}`;

    // 3. Trigger Native SMS Handler
    // On mobile, this opens the Messages app. Browser security typically allows only ONE prompt per user gesture.
    triggerNativeSms(targetNumbers[0] as string, smsMessage);
    
    // 4. Handle remaining targets (Simulation for demo, in production use an API like Twilio)
    setTimeout(() => {
      const count = targetNumbers.length;
      let notification = `🚀 SMS Dispatch initiated!`;
      if (count > 1) {
        notification += `\n\nApp opened for the first recipient. The other ${count - 1} recipients have been queued for system dispatch.`;
      }
      alert(notification);
      setIsSending(false);
      onComplete();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Blast to Network</h2>
            <p className="text-sm text-gray-500 font-medium tracking-tight">Generate and share produce links via SMS</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-90"><X size={28}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* LIVE SMS PREVIEW BOX */}
          <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-100 relative shadow-sm">
            <span className="absolute -top-3 left-6 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">SMS PREVIEW</span>
            <p className="text-sm text-emerald-900 italic leading-relaxed pt-2">
              "Hi! <span className="font-bold">{owner?.businessName || 'Green Valley'}</span> just listed fresh <span className="font-bold">{product?.name || 'Tomatoes'}</span>! 🔥 Price: <span className="font-bold">${product?.defaultPricePerKg.toFixed(2) || '4.50'}/kg</span>. View product and trade here: <span className="underline font-bold text-emerald-700">https://pz.io/l/...</span>"
            </p>
          </div>

          {/* CONNECTED PROFILES SELECTION */}
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Users size={16}/> Saved Connections ({customers.length})</h3>
               <button 
                  onClick={() => setSelectedCustomerIds(selectedCustomerIds.length === customers.length ? [] : customers.map(c => c.id))} 
                  className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest"
                >
                  {selectedCustomerIds.length === customers.length ? 'DESELECT ALL' : 'SELECT ALL'}
                </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {customers.map(customer => (
                <div 
                  key={customer.id} 
                  onClick={() => toggleCustomer(customer.id)} 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedCustomerIds.includes(customer.id) ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${selectedCustomerIds.includes(customer.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {customer.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-bold ${selectedCustomerIds.includes(customer.id) ? 'text-emerald-900' : 'text-gray-700'}`}>{customer.businessName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{customer.phone || 'NO MOBILE SAVED'}</p>
                    </div>
                  </div>
                  {selectedCustomerIds.includes(customer.id) ? <CheckCircle className="text-emerald-600" size={24}/> : <div className="w-6 h-6 rounded-full border-2 border-gray-100" />}
                </div>
              ))}
              {customers.length === 0 && (
                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Users size={32} className="mx-auto text-gray-200 mb-2"/>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No saved connections found.</p>
                </div>
              )}
            </div>
          </div>

          {/* MANUAL MOBILE INPUT */}
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Smartphone size={16}/> Add Manual Recipients</h3>
               <button 
                  onClick={handleConnectContacts} 
                  disabled={isSyncingContacts} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors tracking-widest disabled:opacity-50"
                >
                  {isSyncingContacts ? <Loader2 size={14} className="animate-spin"/> : <Contact size={14}/>}
                  SYNC DEVICE CONTACTS
                </button>
            </div>
            <div className="flex gap-3">
              <input 
                type="tel" 
                placeholder="Enter mobile number..." 
                value={currentManualNumber} 
                onChange={(e) => setCurrentManualNumber(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && addManualNumber()} 
                className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-base font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder-gray-300"
              />
              <button 
                onClick={addManualNumber} 
                className="bg-slate-900 hover:bg-black text-white rounded-2xl w-16 flex items-center justify-center transition-all shadow-lg active:scale-95 border-2 border-slate-900"
              >
                <Plus size={24}/>
              </button>
            </div>
            {manualNumbers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 animate-in slide-in-from-top-2 duration-300">
                {manualNumbers.map(num => (
                  <div key={num} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-xs font-black flex items-center gap-3 border border-slate-200 shadow-sm animate-in zoom-in duration-200">
                    {num}
                    <button onClick={() => removeManualNumber(num)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 bg-white border-2 border-gray-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all shadow-sm">
            Cancel
          </button>
          <button 
            onClick={handleSendBlast}
            disabled={isSending || (selectedCustomerIds.length === 0 && manualNumbers.length === 0)}
            className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSending ? (
              <><Loader2 size={20} className="animate-spin" /> DISPATCHING...</>
            ) : (
              <><Smartphone size={20} /> OPEN SMS APP ({selectedCustomerIds.length + manualNumbers.length})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- AssignTeamModal --- */
const AssignTeamModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAssign: (packerId: string, driverId: string) => void;
    drivers: Driver[];
    packers: Packer[];
}> = ({ isOpen, onClose, onAssign, drivers, packers }) => {
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedPacker, setSelectedPacker] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Assign Fulfillment Team</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Packer</label>
                        <select 
                            value={selectedPacker}
                            onChange={e => setSelectedPacker(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="">Select Packer</option>
                            {packers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Driver</label>
                        <select 
                            value={selectedDriver}
                            onChange={e => setSelectedDriver(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="">Select Driver</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 text-gray-600 font-bold">Cancel</button>
                    <button 
                        onClick={() => onAssign(selectedPacker, selectedDriver)}
                        disabled={!selectedDriver || !selectedPacker}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold disabled:opacity-50 transition-all"
                    >
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- SellerDashboardV1 --- */
export const SellerDashboardV1: React.FC<SellerDashboardV1Props> = ({ user, onSwitchVersion }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'Orders' | 'Inventory'>('Orders');
  
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packers, setPackers] = useState<Packer[]>([]);

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
  };

  const handleConfirmOrder = (packerId: string, driverId: string) => {
      if (confirmingOrder) {
          const packer = packers.find(p => p.id === packerId);
          const driver = drivers.find(d => d.id === driverId);
          mockService.confirmOrderV1(confirmingOrder.id, confirmingOrder.items, packerId, packer?.name, driverId, driver?.name);
          setConfirmingOrder(null);
          loadData();
          alert("Order confirmed and assigned to team!");
      }
  };

  const handleSwitchToV2 = () => {
      if (confirm('Switch to Advanced Dashboard (Version 2)?')) {
          mockService.updateUserVersion(user.id, 'v2');
          if (onSwitchVersion) onSwitchVersion('v2');
          window.location.reload(); 
      }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Operations Console (v1)</h1>
          <p className="text-sm text-gray-500 font-medium">Simplified wholesale management for {user.businessName}</p>
        </div>
        <button 
          onClick={handleSwitchToV2}
          className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100 shadow-sm"
        >
          <TrendingUp size={18}/> Switch to v2
        </button>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setActiveTab('Orders')} className={`px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${activeTab === 'Orders' ? 'bg-[#043003] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>Orders Management</button>
        <button onClick={() => setActiveTab('Inventory')} className={`px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${activeTab === 'Inventory' ? 'bg-[#043003] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>Stock Control</button>
      </div>

      {activeTab === 'Orders' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Active Marketplace Queue</h3>
            <span className="text-[10px] bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-black border border-orange-100 uppercase tracking-widest">{orders.filter(o => o.status === 'Pending').length} Action Required</span>
          </div>
          <div className="divide-y divide-gray-100">
            {orders.map(order => (
              <div key={order.id} className="p-6 flex justify-between items-center hover:bg-gray-50/50 transition-colors group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-lg tracking-tight">#{order.id.split('-')[1] || order.id}</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest border ${order.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{order.status}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Buyer: {mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName || 'Marketplace Client'}</p>
                  <p className="text-lg font-black text-emerald-600 tracking-tight">${order.totalAmount.toFixed(2)}</p>
                </div>
                {order.status === 'Pending' && (
                  <button 
                    onClick={() => setConfirmingOrder(order)}
                    className="px-8 py-3 bg-[#043003] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black shadow-lg transition-all active:scale-95"
                  >
                    Confirm & Assign Team
                  </button>
                )}
              </div>
            ))}
            {orders.length === 0 && <div className="p-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No active orders in queue</div>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inventory.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-inner-sm">
                  <img src={products.find(p => p.id === item.productId)?.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-lg leading-tight tracking-tight">{products.find(p => p.id === item.productId)?.name}</h4>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">{item.quantityKg}kg available</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">Update Stock</button>
                <button className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Share Lot</button>
              </div>
            </div>
          ))}
          {inventory.length === 0 && (
             <div className="col-span-full py-16 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <Package size={48} className="mx-auto text-gray-200 mb-4"/>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No items currently listed in your catalog</p>
             </div>
          )}
        </div>
      )}

      {confirmingOrder && (
          <AssignTeamModal 
              isOpen={!!confirmingOrder}
              onClose={() => setConfirmingOrder(null)}
              onAssign={handleConfirmOrder}
              drivers={drivers}
              packers={packers}
          />
      )}
    </div>
  );
};
