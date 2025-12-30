import React, { useState, useEffect, useRef } from 'react';
import { User, Order, InventoryItem, Product, Driver, Packer, OrderItem, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { 
  Package, Truck, MapPin, AlertTriangle, LayoutDashboard, 
  Users, Clock, CheckCircle, X, UploadCloud, 
  DollarSign, Camera, Check, ChevronDown, Info, Search, Bell, Settings, Lock, TrendingUp
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

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
        mockService.addAppNotification('u1', 'Packing Issue Reported', `URGENT: Order #${order.id} - Issue reported.`, 'SYSTEM', '/');
    };

    const togglePacked = (productId: string) => {
        setPackedItems(prev => ({...prev, [productId]: !prev[productId]}));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                    <div className="flex items-center gap-3">
                        <Package size={24}/>
                        <h2 className="text-xl font-bold text-gray-900">Packing List - #{order.id}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100">
                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Item</th>
                                <th className="py-3 px-4 text-right">Quantity</th>
                                <th className="py-3 px-4 text-right">Issues</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items.map((item, idx) => {
                                const product = mockService.getProduct(item.productId);
                                return (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="py-4 px-4">
                                            <button 
                                                onClick={() => togglePacked(item.productId)}
                                                className={`w-8 h-8 rounded border flex items-center justify-center ${packedItems[item.productId] ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300'}`}
                                            >
                                                {packedItems[item.productId] && <Check size={16}/>}
                                            </button>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-bold">{product?.name}</p>
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold">{item.quantityKg}kg</td>
                                        <td className="py-4 px-4 text-right">
                                            <button onClick={() => setReportingItemId(item.productId)} className="text-red-500 hover:underline text-xs font-bold">Report Issue</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Packer</label>
                            <select value={selectedPacker} onChange={e => setSelectedPacker(e.target.value)} className="w-full p-3 border rounded-xl bg-white">
                                <option value="">Select Packer</option>
                                {packers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Driver</label>
                            <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="w-full p-3 border rounded-xl bg-white">
                                <option value="">Select Driver</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-600 font-bold">Cancel</button>
                    <button 
                        onClick={() => onComplete(selectedPacker, selectedDriver, '')}
                        disabled={!selectedDriver || !selectedPacker}
                        className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50"
                    >
                        Confirm Packing
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
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packers, setPackers] = useState<Packer[]>([]);
  const [packingOrder, setPackingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    setOrders(mockService.getOrders(user.id).filter(o => o.sellerId === user.id));
    setDrivers(mockService.getDrivers(user.id));
    setPackers(mockService.getPackers(user.id));
  };

  const isProfileComplete = user.businessProfile?.isComplete || false;

  const handleAcceptOrder = (order: Order) => {
    if (!isProfileComplete) {
        alert("Please complete onboarding documents in Settings first.");
        return;
    }
    mockService.acceptOrderV2(order.id);
    loadData();
  };

  const handleCompletePacking = (packerId: string, driverId: string, photo: string) => {
    if (!packingOrder) return;
    const packerName = packers.find(p => p.id === packerId)?.name || 'Team';
    const driverName = drivers.find(d => d.id === driverId)?.name || 'Partner';
    mockService.packOrder(packingOrder.id, packerName, driverId, driverName);
    setPackingOrder(null);
    loadData();
  };

  const pending = orders.filter(o => o.status === 'Pending');
  const accepted = orders.filter(o => ['Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const displayed = orderSubTab === 'Pending Acceptance' ? pending : accepted;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-[#0F172A]">Operations Console</h1>
        <p className="text-gray-500">Managing {user.businessName}</p>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          {['Order Management', 'Sell', 'Customers', 'Settings'].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Order Management' && (
          <div className="space-y-6">
              <div className="flex gap-4 border-b border-gray-200">
                  {['Pending Acceptance', 'Accepted'].map(sub => (
                      <button 
                        key={sub} onClick={() => setOrderSubTab(sub)}
                        className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${orderSubTab === sub ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}
                      >
                          {sub}
                      </button>
                  ))}
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {displayed.length === 0 ? (
                      <div className="py-20 text-center text-gray-400">No orders in this queue.</div>
                  ) : displayed.map(order => (
                      <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                          <div>
                              <h3 className="font-bold text-lg">Order #{order.id.split('-')[1]}</h3>
                              <p className="text-sm text-gray-500">Value: ${order.totalAmount.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2">
                              {order.status === 'Pending' ? (
                                  <button 
                                    onClick={() => handleAcceptOrder(order)}
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700"
                                  >
                                      Accept Order
                                  </button>
                              ) : (
                                  <button 
                                    onClick={() => setPackingOrder(order)}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700"
                                  >
                                      Start Packing
                                  </button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'Sell' && <AiOpportunityMatcher user={user} />}
      {activeTab === 'Settings' && <SettingsComponent user={user} onRefreshUser={loadData} />}

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