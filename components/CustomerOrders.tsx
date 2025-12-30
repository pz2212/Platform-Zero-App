
import React, { useState, useEffect } from 'react';
import { User, Order, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { Package, Clock, CheckCircle, Truck, X, Calendar, MapPin, DollarSign, ChevronRight, AlertTriangle, MessageSquare, Leaf, Info, FileText, Share2, Download } from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface CustomerOrdersProps {
  user: User;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // UI States
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedIssueOrder, setSelectedIssueOrder] = useState<Order | null>(null);
  const [selectedIssueItem, setSelectedIssueItem] = useState<{name: string, id: string} | null>(null);
  const [showImpactId, setShowImpactId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Polling for new orders
    return () => clearInterval(interval);
  }, [user]);

  const loadOrders = () => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
    setOrders(allOrders);
    setProducts(mockService.getAllProducts());
  };

  const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const historyOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  const calculateImpact = (order: Order) => {
      let co2Saved = 0;
      let wastePrevented = 0;
      order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              co2Saved += (product.co2SavingsPerKg || 0.5) * item.quantityKg;
              wastePrevented += item.quantityKg;
          }
      });
      return { co2Saved, wastePrevented };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ready for Delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'Pending': return <Clock size={14} />;
          case 'Confirmed': return <CheckCircle size={14} />;
          case 'Ready for Delivery': return <Package size={14} />;
          case 'Shipped': return <Truck size={14} />;
          case 'Delivered': return <CheckCircle size={14} />;
          case 'Cancelled': return <X size={14} />;
          default: return <Clock size={14} />;
      }
  };

  const toggleItemCheck = (orderId: string, productId: string) => {
      const key = `${orderId}-${productId}`;
      setCheckedItems(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleReportIssue = (order: Order, item?: {name: string, id: string}) => {
      setSelectedIssueOrder(order);
      setSelectedIssueItem(item || null);
      setIssueModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Order History & Tracking</h1>
            <p className="text-gray-500">Manage active shipments and view past order impact reports.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex shadow-sm">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-2 px-6 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package size={18}/>
            Current Orders
            {activeOrders.length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                    {activeOrders.length}
                </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-2 px-6 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock size={18}/>
            Past Orders
          </button>
      </div>

      <div className="space-y-6">
        {displayedOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-inner">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No orders found</h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                    {activeTab === 'active' ? "You don't have any orders in transit right now." : "You haven't completed any orders yet."}
                </p>
                {activeTab === 'active' && (
                    <button onClick={() => window.location.hash = '#/marketplace'} className="mt-6 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md">
                        Shop Marketplace
                    </button>
                )}
            </div>
        ) : (
            displayedOrders.map(order => {
                const impact = calculateImpact(order);
                const isImpactOpen = showImpactId === order.id;

                return (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all animate-in zoom-in-95 duration-200">
                        {/* Order Header */}
                        <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Order Ref</span>
                                    <div className="font-mono font-black text-gray-900 text-sm">#{order.id.split('-')[1] || order.id}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Order Date</span>
                                    <div className="font-bold text-gray-700 text-sm">{new Date(order.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Direct Supplier</span>
                                    <div className="font-bold text-indigo-600 text-sm truncate max-w-[120px]">{mockService.getAllUsers().find(u => u.id === order.sellerId)?.businessName || 'Connected Partner'}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Total Due</span>
                                    <div className="font-black text-emerald-700 text-lg">${order.totalAmount.toFixed(2)}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 self-end sm:self-center">
                                <button 
                                    onClick={() => setShowImpactId(isImpactOpen ? null : order.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all ${isImpactOpen ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-100' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                                >
                                    <Leaf size={14} className={isImpactOpen ? 'animate-bounce' : ''}/> {isImpactOpen ? 'Close Report' : 'See Impact Report'}
                                </button>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)} shadow-sm`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        {/* IMPACT REPORT OVERLAY */}
                        {isImpactOpen && (
                            <div className="bg-[#043003] text-white p-8 animate-in slide-in-from-top-6 duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform scale-150 rotate-12"><Leaf size={240}/></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Environmental Contribution Summary</h4>
                                            <p className="text-gray-300 text-sm max-w-lg">By purchasing through Platform Zero, you've diverted these products from landfill and shortened the supply chain.</p>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm flex gap-2">
                                            <Share2 size={20} className="text-emerald-400 cursor-pointer hover:scale-110 transition-transform" />
                                            <Download size={20} className="text-emerald-400 cursor-pointer hover:scale-110 transition-transform" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center">
                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4 ring-1 ring-emerald-500/30">
                                                <Leaf size={24}/>
                                            </div>
                                            <p className="text-4xl font-black mb-1">{impact.co2Saved.toFixed(1)}<span className="text-xl text-emerald-400 ml-1">kg</span></p>
                                            <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-widest">CO2 Emissions Saved</p>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center">
                                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-4 ring-1 ring-blue-500/30">
                                                <Package size={24}/>
                                            </div>
                                            <p className="text-4xl font-black mb-1">{impact.wastePrevented.toFixed(0)}<span className="text-xl text-blue-400 ml-1">kg</span></p>
                                            <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest">Food Waste Prevented</p>
                                        </div>

                                        <div className="lg:col-span-2 bg-emerald-900/50 border border-emerald-500/20 p-6 rounded-2xl flex items-center gap-6">
                                            <div className="flex-1">
                                                <h5 className="text-sm font-bold text-white mb-2">Sustainable Sourcing Tier</h5>
                                                <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-emerald-400" style={{width: '75%'}}></div>
                                                </div>
                                                <p className="text-xs text-emerald-400/80 font-medium">You are in the <span className="text-white font-bold">Top 15%</span> of sustainable buyers this month!</p>
                                            </div>
                                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                                                <CheckCircle size={32} className="text-emerald-900" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400/60 font-medium italic">
                                        <Info size={14}/> Impact metrics are verified via the Platform Zero farm-gate audit trail and regional waste-diversion benchmarks.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Body */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                                {/* Fulfillment Details */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Truck size={16} className="text-indigo-600"/> Delivery Logistics
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1">Expected Delivery</span>
                                            <p className="text-gray-900 font-bold">{order.logistics?.deliveryDate ? new Date(order.logistics.deliveryDate).toLocaleDateString() : 'Scheduling...'} <span className="text-indigo-600 font-black ml-1">@{order.logistics?.deliveryTime || 'TBD'}</span></p>
                                        </div>
                                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1">Drop-off Point</span>
                                            <p className="text-gray-900 font-bold truncate" title={order.logistics?.deliveryLocation}>{order.logistics?.deliveryLocation || 'Loading address...'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Accounting Details */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign size={16} className="text-emerald-600"/> Financial Categorization
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Account Category</span>
                                            <p className="text-gray-900 font-bold">Cost of Goods (COGS)</p>
                                        </div>
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Payment Method</span>
                                            <p className="text-gray-900 font-bold uppercase">{order.paymentMethod || 'invoice'} terms</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized List */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <Package size={16} className="text-gray-400"/> Order manifest
                                </h4>
                                
                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
                                    {order.items.map((item, idx) => {
                                        const product = products.find(p => p.id === item.productId);
                                        const isChecked = checkedItems[`${order.id}-${item.productId}`];
                                        
                                        return (
                                            <div key={idx} className={`p-4 flex justify-between items-center transition-all ${order.status === 'Delivered' ? isChecked ? 'bg-emerald-50/50' : 'hover:bg-white' : 'bg-white'}`}>
                                                <div className="flex items-center gap-4">
                                                    {order.status === 'Delivered' && (
                                                        <div 
                                                            onClick={() => toggleItemCheck(order.id, item.productId)}
                                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white scale-110 shadow-sm' : 'bg-white border-gray-300 hover:border-emerald-400'}`}
                                                        >
                                                            {isChecked && <CheckCircle size={16}/>}
                                                        </div>
                                                    )}
                                                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                                                        <img src={product?.imageUrl} alt="" className={`h-full w-full object-cover ${order.status === 'Delivered' && !isChecked ? 'opacity-50 grayscale-[0.5]' : ''}`}/>
                                                    </div>
                                                    <div>
                                                        <p className={`font-black text-sm ${order.status === 'Delivered' && isChecked ? 'text-emerald-900' : 'text-gray-900'}`}>{product?.name || 'Loading item name...'}</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.quantityKg}kg &times; ${item.pricePerKg.toFixed(2)}/kg</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-sm font-black text-gray-900">${(item.quantityKg * item.pricePerKg).toFixed(2)}</div>
                                                    {order.status === 'Delivered' && (
                                                        <button onClick={() => handleReportIssue(order, {name: product?.name || 'Item', id: item.productId})} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all" title="Report Issue"><AlertTriangle size={18}/></button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Action Footer */}
                            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex gap-4">
                                    {order.status === 'Delivered' && (
                                        <button onClick={() => handleReportIssue(order)} className="text-red-600 hover:text-red-700 text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-red-100 bg-red-50/50 px-4 py-2.5 rounded-xl transition-all shadow-sm">
                                            <MessageSquare size={16}/> Report Dispute
                                        </button>
                                    )}
                                    <button className="text-gray-500 hover:text-gray-700 text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-xl transition-all bg-white shadow-sm">
                                        <FileText size={16}/> Digital Receipt
                                    </button>
                                </div>
                                <button className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest flex items-center gap-1 group">
                                    Download Full Tax Invoice <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {issueModalOpen && selectedIssueOrder && (
          <ChatDialog 
              isOpen={issueModalOpen}
              onClose={() => setIssueModalOpen(false)}
              orderId={selectedIssueOrder.id.split('-')[1] || selectedIssueOrder.id}
              issueType={selectedIssueItem ? `Quality Issue with ${selectedIssueItem.name}` : `Delivery Issue`}
              repName="Platform Zero Admin Support"
          />
      )}
    </div>
  );
};
