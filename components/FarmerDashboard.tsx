
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, InventoryItem, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Sprout, Leaf, ShoppingBag, DollarSign, TrendingUp, 
  Calendar, MapPin, CheckCircle, Clock, Plus, 
  BarChart4, ArrowRight, Package, Truck, Info, Heart,
  Edit2, CloudRain, Thermometer, Droplets, SprayCan, FileText, Camera, X, Share2, Search, ChevronDown
} from 'lucide-react';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';

interface FarmerDashboardProps {
  user: User;
}

const HarvestLoggingModal = ({ isOpen, onClose, onSave, products }: any) => {
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        description: '',
        sprays: '',
        water: '',
        weather: 'Sunny',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Log New Harvest</h2>
                        <p className="text-sm text-gray-500 font-medium">Record field conditions and product specifics.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100"><X size={24}/></button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Product</label>
                            <select 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.productId}
                                onChange={e => setFormData({...formData, productId: e.target.value})}
                            >
                                <option value="">Select Produce...</option>
                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Estimated Quantity (kg)</label>
                            <input 
                                type="number"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0.00"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Harvest Description</label>
                        <textarea 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                            placeholder="e.g. Field 4, row 12. Early morning pick, high sugar content."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <SprayCan size={14} className="text-orange-500"/> Sprays / Inputs Used
                            </label>
                            <input 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Organic fungicide etc."
                                value={formData.sprays}
                                onChange={e => setFormData({...formData, sprays: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Droplets size={14} className="text-blue-500"/> Water Added (L/m2)
                            </label>
                            <input 
                                type="number"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0"
                                value={formData.water}
                                onChange={e => setFormData({...formData, water: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                            <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Time</label>
                            <input type="time" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Weather</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={formData.weather} onChange={e => setFormData({...formData, weather: e.target.value})}>
                                <option>Sunny</option>
                                <option>Overcast</option>
                                <option>Rainy</option>
                                <option>Frosty</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(formData)}
                        className="flex-[2] py-4 bg-[#043003] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18}/> List Harvest
                    </button>
                </div>
            </div>
        </div>
    );
};

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ user }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);

  const statsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    const handleClickOutside = (event: MouseEvent) => {
      if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target as Node)) {
        setShowStatsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const loadData = () => {
    setInventory(mockService.getInventory(user.id));
    setOrders(mockService.getOrders(user.id).filter(o => o.sellerId === user.id));
    setProducts(mockService.getAllProducts());
  };

  const handleSaveHarvest = (data: any) => {
      const newItem: InventoryItem = {
          id: `inv-${Date.now()}`,
          productId: data.productId,
          ownerId: user.id,
          quantityKg: parseFloat(data.quantity),
          status: 'Available',
          harvestDate: `${data.date}T${data.time}:00Z`,
          expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          harvestLocation: `Field Update: ${data.weather}`,
          notes: JSON.stringify({
              sprays: data.sprays,
              water: data.water,
              description: data.description,
              weather: data.weather
          })
      };
      mockService.addInventoryItem(newItem);
      setIsHarvestModalOpen(false);
      loadData();
      alert("Harvest lot listed and live on the marketplace!");
  };

  const handleUpdateItem = (item: InventoryItem) => {
      const newQty = prompt(`Updating ${products.find(p => p.id === item.productId)?.name}. Enter new total quantity (kg):`, item.quantityKg.toString());
      if (newQty !== null) {
          mockService.updateInventoryStatus(item.id, item.status); // Refresh trigger
          const allInv = mockService.getAllInventory();
          const target = allInv.find(i => i.id === item.id);
          if (target) {
              target.quantityKg = parseFloat(newQty);
              localStorage.setItem('pz_orders', JSON.stringify(allInv)); // Forces pseudo-persistence for demo
          }
          loadData();
      }
  };

  const pendingDeliveries = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#043003] tracking-tight flex items-center gap-3">
            <Sprout size={32} className="text-[#10B981]"/> Farmer Portal
          </h1>
          <p className="text-gray-500 font-medium mt-1">Managing {user.businessName} • Harvest to Market Console</p>
        </div>
      </div>

      {/* KPI Stats Grid - CONSOLIDATED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* REVENUE & PRIMARY ACTIONS CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-100 flex flex-col justify-between min-h-[200px]">
          <div>
            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Farm Revenue (Weekly)</p>
            <div className="flex justify-between items-end">
                <h3 className="text-5xl font-black text-gray-900 tracking-tighter">$4,280</h3>
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><DollarSign size={28}/></div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button 
                onClick={() => setIsHarvestModalOpen(true)}
                className="flex-[2] py-4 bg-[#043003] hover:bg-black text-white rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
            >
                <Plus size={16}/> List New Harvest
            </button>
            <button 
                onClick={() => setIsSellModalOpen(true)}
                className="flex-1 py-4 bg-white border-2 border-[#043003] text-[#043003] rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
            >
                <Camera size={16}/> Sell
            </button>
          </div>
        </div>

        {/* COMPACT STATS DROPDOWN CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[200px] relative" ref={statsDropdownRef}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Operational Health</p>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Insights</h3>
                </div>
                <button 
                    onClick={() => setShowStatsDropdown(!showStatsDropdown)}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all flex items-center gap-2"
                >
                    <span className="text-xs font-black uppercase tracking-widest text-gray-600">View Stats</span>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${showStatsDropdown ? 'rotate-180' : ''}`}/>
                </button>
            </div>

            {/* PREVIEW OF PRIMARY STAT */}
            <div className="mt-4 flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Leaf size={24}/></div>
                <div>
                    <p className="text-2xl font-black text-gray-900">{inventory.length} Stock Lots</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live in Marketplace</p>
                </div>
            </div>

            {/* THE DROPDOWN CONTENT */}
            {showStatsDropdown && (
                <div className="absolute top-[90%] left-0 right-0 z-50 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 animate-in slide-in-from-top-4 duration-200 mt-2 mx-4">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><Leaf size={20}/></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Active Inventory</p>
                                <p className="text-lg font-black text-gray-900">{inventory.length} Lots Available</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600"><Truck size={20}/></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Logistics Status</p>
                                <p className="text-lg font-black text-gray-900">{pendingDeliveries.length} Pickups Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600"><Heart size={20}/></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Carbon Impact</p>
                                <p className="text-lg font-black text-gray-900">420kg CO2e Diverted</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CURRENT HARVEST GRID */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                    <Droplets className="text-emerald-500" size={24}/> Current Field Harvest
                </h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{inventory.length} Active Lots</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventory.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                        <Plus size={48} className="mx-auto text-gray-200 mb-4"/>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No active harvest lots. Use the button above to start.</p>
                    </div>
                ) : (
                    inventory.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        let fieldData = { sprays: 'Standard', water: 'Logged', weather: 'Mixed', description: '' };
                        try { if(item.notes) fieldData = JSON.parse(item.notes); } catch(e){}

                        return (
                            <div key={item.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all animate-in zoom-in-95">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                            <img src={product?.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-xl tracking-tight leading-none">{product?.name}</h4>
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">{item.quantityKg}kg available</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleUpdateItem(item)} className="p-2 bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-full transition-colors">
                                        <Edit2 size={18}/>
                                    </button>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                        <span className="flex items-center gap-2"><SprayCan size={14} className="text-orange-400"/> Sprays:</span>
                                        <span className="text-gray-900">{fieldData.sprays || 'None'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                        <span className="flex items-center gap-2"><Droplets size={14} className="text-blue-400"/> Irrigation:</span>
                                        <span className="text-gray-900">{fieldData.water}L/m2</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                        <span className="flex items-center gap-2"><CloudRain size={14} className="text-slate-400"/> Weather:</span>
                                        <span className="text-gray-900">{fieldData.weather}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Harvested: {new Date(item.harvestDate).toLocaleDateString()}
                                    </p>
                                    <button 
                                        onClick={() => handleUpdateItem(item)}
                                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                    >
                                        Update Harvest Status
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* Action Center - Sidebar Style */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <Sprout size={180}/>
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-6">Market Demand</h3>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <p className="text-sm font-bold text-white mb-1">Melbourne Fresh Needs Broccoli</p>
                  <p className="text-xs text-slate-400">Targeting 200kg @ $3.50/kg</p>
                  <button className="mt-3 text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1 hover:text-white transition-colors">
                    Fulfill Now <ArrowRight size={12}/>
                  </button>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <p className="text-sm font-bold text-white mb-1">Sydney Bio-Gro Needs Carrots</p>
                  <p className="text-xs text-slate-400">Looking for 500kg Imperfect Grade</p>
                  <button className="mt-3 text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1 hover:text-white transition-colors">
                    Submit Pricing <ArrowRight size={12}/>
                  </button>
                </div>
              </div>
            </div>
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
              <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all">
                Browse Global Needs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <HarvestLoggingModal 
          isOpen={isHarvestModalOpen} 
          onClose={() => setIsHarvestModalOpen(false)}
          products={products}
          onSave={handleSaveHarvest}
      />

      {isSellModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] overflow-hidden relative shadow-2xl flex flex-col border border-gray-100">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase"><Camera size={32} className="text-indigo-600"/> Rapid Opportunity Capture</h2>
                    <button onClick={() => setIsSellModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100"><X size={28}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AiOpportunityMatcher user={user} />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
