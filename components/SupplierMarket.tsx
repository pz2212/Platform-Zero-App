
import React, { useState, useEffect, useRef } from 'react';
import { User, InventoryItem, Product, UserRole, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { Store, MapPin, Tag, Phone, MessageSquare, ChevronDown, ChevronUp, ShoppingCart, X, CheckCircle, FileText, Download, Users, AlertTriangle, DollarSign, Truck, Send } from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface SupplierMarketProps {
  user: User;
}

interface BuyingOpportunity {
    id: string;
    businessName: string;
    need: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    statusText?: string;
}

export const SupplierMarket: React.FC<SupplierMarketProps> = ({ user }) => {
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  
  // Interaction State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemSupplier, setSelectedItemSupplier] = useState<User | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
  
  // Invoice Modal State
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRep, setActiveChatRep] = useState('Partner Support');
  
  // Pricing Popover State (New Feature)
  const [activeConnectId, setActiveConnectId] = useState<string | null>(null);
  const [submitPrice, setSubmitPrice] = useState('');
  const [submitTransport, setSubmitTransport] = useState('');

  // Data Cache
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryItem[]>>({});
  const [products] = useState<Product[]>(mockService.getAllProducts());

  // Mock Buying Opportunities (Based on user request image)
  const [opportunities] = useState<BuyingOpportunity[]>([
    { id: 'opp1', businessName: 'Melbourne Fresh Distributors', need: 'Needs: Broccoli 250kg', priority: 'HIGH' },
    { id: 'opp2', businessName: 'Sydney Premium Produce', need: 'Needs: Asparagus 180kg', priority: 'MEDIUM' },
    { id: 'opp3', businessName: 'Brisbane Organic Wholesale', need: 'Needs: Carrots 300kg', priority: 'LOW' },
    { id: 'opp4', businessName: 'Metro Food Services', need: 'Credit approved • Waste reduction partner', priority: 'MEDIUM' }
  ]);

  useEffect(() => {
    const allUsers = mockService.getAllUsers();
    const potentialSuppliers = allUsers.filter(u => 
        u.id !== user.id && 
        (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER)
    );
    setSuppliers(potentialSuppliers);

    const invMap: Record<string, InventoryItem[]> = {};
    potentialSuppliers.forEach(supplier => {
        const items = mockService.getInventoryByOwner(supplier.id).filter(i => i.status === 'Available');
        if (items.length > 0) {
            invMap[supplier.id] = items;
        }
    });
    setInventoryMap(invMap);
  }, [user]);

  const toggleSupplier = (supplierId: string) => {
    setExpandedSupplierId(expandedSupplierId === supplierId ? null : supplierId);
  };

  const handleProductClick = (item: InventoryItem, supplier: User) => {
      setSelectedItem(item);
      setSelectedItemSupplier(supplier);
      setPurchaseQuantity(item.quantityKg);
      setShowInvoice(false);
  };

  const handleInitiateBuy = () => {
      setShowInvoice(true);
  };

  const handleConfirmPurchase = () => {
      if (selectedItem && selectedItemSupplier) {
          const product = products.find(p => p.id === selectedItem.productId);
          const price = product?.defaultPricePerKg || 0;
          mockService.createInstantOrder(user.id, selectedItem, purchaseQuantity, price);
          alert(`Order Confirmed! Invoice has been added to your Accounts Payable.`);
          setSelectedItem(null);
          setSelectedItemSupplier(null);
          setShowInvoice(false);
      }
  };

  const handlePricingSubmit = (opp: BuyingOpportunity) => {
      if (!submitPrice) {
          alert("Please enter a price.");
          return;
      }
      alert(`Pricing submitted to ${opp.businessName}!\n\nPrice: $${submitPrice}/kg\nTransport: $${submitTransport || '0.00'}\n\nThe buyer has been notified and can now open a chat to finalize.`);
      setActiveConnectId(null);
      setSubmitPrice('');
      setSubmitTransport('');
      
      // Optionally open chat after submission
      setActiveChatRep(opp.businessName);
      setIsChatOpen(true);
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown';
  const getProductImage = (id: string) => products.find(p => p.id === id)?.imageUrl;
  const getProductPrice = (id: string) => products.find(p => p.id === id)?.defaultPricePerKg || 0;

  const activeSuppliers = suppliers.filter(s => inventoryMap[s.id] && inventoryMap[s.id].length > 0);
  const selectedProductDetails = selectedItem ? products.find(p => p.id === selectedItem.productId) : null;

  return (
    <div className="space-y-10 pb-20">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Supplier Market</h1>
                <p className="text-gray-500 font-medium mt-1">Connect with network partners to buy and sell wholesale stock.</p>
            </div>
        </div>

        {/* --- NEW SECTION: READY TO PURCHASE WHOLESALERS --- */}
        <div className="bg-[#F1F7FF] rounded-[2rem] border border-[#D1E6FF] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm border border-blue-100">
                    <Users size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-[#1E3A8A] tracking-tight">Ready to Purchase Wholesalers</h2>
                    <p className="text-[#3B82F6] font-medium text-sm">Allocated wholesalers ready to purchase products needing quick sale</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {opportunities.map(opp => (
                    <div key={opp.id} className="bg-white rounded-2xl border-2 border-[#E5F1FF] p-6 shadow-sm hover:shadow-md transition-all relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-[#1E3A8A] text-lg tracking-tight mb-1">{opp.businessName}</h3>
                                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wide">
                                    <AlertTriangle size={14}/> {opp.need}
                                </div>
                            </div>
                            <div className="relative">
                                <button 
                                    onClick={() => setActiveConnectId(activeConnectId === opp.id ? null : opp.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                                        activeConnectId === opp.id 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                        : 'bg-white border-blue-100 text-blue-600 hover:border-blue-400'
                                    }`}
                                >
                                    Connect <ChevronDown size={16} className={activeConnectId === opp.id ? 'rotate-180 transition-transform' : 'transition-transform'}/>
                                </button>

                                {/* SUBMIT PRICING POPOVER */}
                                {activeConnectId === opp.id && (
                                    <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-6 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                                        <h4 className="font-black text-gray-900 mb-6 text-sm uppercase tracking-widest">Submit Pricing</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Price per kg ($)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                    value={submitPrice}
                                                    onChange={e => setSubmitPrice(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Transport cost ($)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                    value={submitTransport}
                                                    onChange={e => setSubmitTransport(e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handlePricingSubmit(opp)}
                                                className="w-full py-4 bg-[#7E8B80] hover:bg-[#6A766C] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all mt-4"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                opp.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                                opp.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                                {opp.priority} PRIORITY
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Existing Market Content */}
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Direct Supplier Catalogs</h2>
                    <p className="text-sm text-gray-500 font-medium">Browse products from verified network suppliers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {activeSuppliers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-inner">
                        <Store size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No active suppliers found</h3>
                    </div>
                ) : (
                    activeSuppliers.map(supplier => {
                        const items = inventoryMap[supplier.id];
                        const isExpanded = expandedSupplierId === supplier.id;
                        const location = items[0]?.harvestLocation || 'Australia';

                        return (
                            <div key={supplier.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                                <div 
                                    onClick={() => toggleSupplier(supplier.id)}
                                    className="p-8 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner-sm ${
                                            supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {supplier.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{supplier.businessName}</h3>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 ${
                                                    supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                    {supplier.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-gray-400 mt-2 font-bold uppercase tracking-tight">
                                                <span className="flex items-center gap-2"><MapPin size={16} className="text-gray-300"/> {location}</span>
                                                <span className="flex items-center gap-2"><Tag size={16} className="text-gray-300"/> {items.length} Products</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 md:mt-0 flex items-center gap-4">
                                        <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-indigo-100">
                                            <MessageSquare size={20} />
                                        </button>
                                        <button className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-emerald-100">
                                            <Phone size={20} />
                                        </button>
                                        <div className="ml-2 bg-gray-100/50 p-2 rounded-xl text-gray-300">
                                            {isExpanded ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-8 animate-in slide-in-from-top-4 duration-300">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {items.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => handleProductClick(item, supplier)}
                                                    className="bg-white rounded-3xl border-2 border-transparent p-5 flex flex-col gap-4 hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer group shadow-sm"
                                                >
                                                    <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-50">
                                                        <img 
                                                            src={getProductImage(item.productId)} 
                                                            alt="" 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-sm">
                                                            {item.quantityKg}kg available
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-lg leading-tight mb-1">{getProductName(item.productId)}</div>
                                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Expires in {Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24))} days</div>
                                                        <div className="mt-4 flex justify-between items-end border-t border-gray-50 pt-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Market Rate</span>
                                                                <span className="font-black text-emerald-600 text-xl">${getProductPrice(item.productId).toFixed(2)}<span className="text-[10px] text-emerald-400">/kg</span></span>
                                                            </div>
                                                            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                <ShoppingCart size={20} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* MODALS */}
        {selectedItem && selectedItemSupplier && selectedProductDetails && !showInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="relative h-56 bg-gray-100">
                        <img src={selectedProductDetails.imageUrl} alt="" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 bg-white/90 backdrop-blur p-2 rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-lg"
                        >
                            <X size={24} />
                        </button>
                        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-black text-indigo-600 uppercase tracking-[0.2em] shadow-md border border-indigo-50">
                            Supplier Direct
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">{selectedProductDetails.name}</h2>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{selectedProductDetails.variety}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-emerald-600 tracking-tight">${selectedProductDetails.defaultPricePerKg.toFixed(2)}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">PER KG (AU)</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-[2rem] border-2 border-gray-100 mb-8 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black shadow-sm">
                                {selectedItemSupplier.businessName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{selectedItemSupplier.businessName}</p>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <MapPin size={12}/> {selectedItem.harvestLocation || 'Melbourne Regional'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Configure Quantity (kg)</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        min="1"
                                        max={selectedItem.quantityKg}
                                        value={purchaseQuantity}
                                        onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 font-black text-2xl text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm uppercase tracking-widest">KG</div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 ml-1">MAX CAPACITY: {selectedItem.quantityKg} KG</p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button 
                                    onClick={handleInitiateBuy}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart size={20} /> Purchase Lot
                                </button>
                                <button 
                                    onClick={() => { setActiveChatRep(selectedItemSupplier.businessName); setIsChatOpen(true); }}
                                    className="w-full py-5 bg-white border-2 border-gray-200 text-gray-500 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center gap-3"
                                >
                                    <MessageSquare size={20} /> Negotiate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <ChatDialog 
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            orderId="MARKET-INQUIRY"
            issueType={`B2B Market Trade: ${activeChatRep}`}
            repName={activeChatRep}
        />
    </div>
  );
};
