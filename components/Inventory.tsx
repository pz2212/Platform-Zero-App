
import React, { useState } from 'react';
import { InventoryItem, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { AlertTriangle, Clock, Leaf, Edit2, Check, X, Calendar, Truck, Search, Globe, Phone, MapPin } from 'lucide-react';
import { getPricingAdvice } from '../services/geminiService';

interface InventoryProps {
  items: InventoryItem[];
}

export const Inventory: React.FC<InventoryProps> = ({ items }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'my_inventory' | 'sourcing'>('my_inventory');

  // Sourcing State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // General Data
  const products = mockService.getAllProducts();
  
  // State for inline price editing
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force re-render on data update

  // State for Status Details Modal
  const [selectedStatusItem, setSelectedStatusItem] = useState<InventoryItem | null>(null);

  const getProduct = (id: string) => products.find(p => p.id === id);

  const getExpiryStatus = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Critical', icon: AlertTriangle, days: diffDays };
    if (diffDays <= 7) return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Warning', icon: Clock, days: diffDays };
    return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Normal', icon: Leaf, days: diffDays };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const handleGetAdvice = async (productName: string, qty: number, days: number) => {
      const advice = await getPricingAdvice(productName, qty, days);
      alert(`AI Pricing Strategy:\n\n${advice}`);
  };

  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice(product.defaultPricePerKg);
  };

  const saveEdit = () => {
    if (editingProductId) {
      mockService.updateProductPrice(editingProductId, editPrice);
      setEditingProductId(null);
      setRefreshTrigger(prev => prev + 1); 
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
      e.preventDefault();
      // Assuming context user is 'u2' (Sarah) for demo, we exclude her items
      const results = mockService.searchGlobalInventory(searchQuery, 'u2');
      setSearchResults(results);
      setHasSearched(true);
  };

  const getOwnerName = (ownerId: string) => {
      const user = mockService.getAllUsers().find(u => u.id === ownerId);
      return user ? user.businessName : 'Unknown Supplier';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
              <button
                  onClick={() => setActiveTab('my_inventory')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'my_inventory'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                  My Inventory
              </button>
              <button
                  onClick={() => setActiveTab('sourcing')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'sourcing'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                  <Globe size={16}/> Source Products
              </button>
          </nav>
      </div>

      {/* --- MY INVENTORY TAB --- */}
      {activeTab === 'my_inventory' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Current Stock</h2>
            <span className="text-sm text-gray-500">{items.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price / kg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => {
                  const product = getProduct(item.productId);
                  const status = getExpiryStatus(item.expiryDate);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={product?.imageUrl} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product?.name}</div>
                            <div className="text-sm text-gray-500">{product?.variety}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{item.quantityKg} kg</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product && (
                            editingProductId === product.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-24 border border-emerald-300 focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1 text-sm outline-none"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                                        step="0.01"
                                        autoFocus
                                    />
                                    <button onClick={saveEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={16}/></button>
                                    <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={16}/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-900 font-bold bg-gray-100 px-2 py-1 rounded">${product.defaultPricePerKg.toFixed(2)}</span>
                                    <button onClick={() => startEdit(product)} className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                            )
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                            onClick={() => setSelectedStatusItem(item)}
                            className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${status.color}`}
                        >
                          <StatusIcon size={12} className="mr-1.5" />
                          {status.label}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {status.days} days left
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => product && handleGetAdvice(product.name, item.quantityKg, status.days)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                            AI Pricing Advice
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                           Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SOURCING TAB --- */}
      {activeTab === 'sourcing' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-xl text-center">
                  <h2 className="text-2xl font-bold text-indigo-900 mb-2">Global Product Search</h2>
                  <p className="text-indigo-600 mb-6 max-w-lg mx-auto">Find and source products from other wholesalers and farmers active on Platform Zero in Australia.</p>
                  
                  <form onSubmit={handleGlobalSearch} className="max-w-2xl mx-auto relative flex items-center">
                      <Search className="absolute left-4 text-gray-400" size={20} />
                      <input 
                          type="text" 
                          placeholder="e.g. 500kg of eggplants" 
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-indigo-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                      />
                      <button 
                          type="submit" 
                          className="absolute right-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                          Search
                      </button>
                  </form>
              </div>

              {hasSearched && (
                  <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                      <div className="p-5 border-b border-gray-200 bg-gray-50">
                          <h3 className="text-lg font-bold text-gray-800">Search Results</h3>
                      </div>
                      <div className="overflow-x-auto">
                          {searchResults.length === 0 ? (
                              <div className="p-10 text-center text-gray-500">
                                  No active products found for "{searchQuery}". Try a broader term.
                              </div>
                          ) : (
                              <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                      <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Available</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Price</th>
                                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                      </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                      {searchResults.map(item => {
                                          const product = getProduct(item.productId);
                                          return (
                                              <tr key={item.id} className="hover:bg-gray-50">
                                                  <td className="px-6 py-4">
                                                      <div className="flex items-center">
                                                          <img src={product?.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover mr-3 bg-gray-100" />
                                                          <div>
                                                              <div className="font-medium text-gray-900">{product?.name}</div>
                                                              <div className="text-xs text-gray-500">{product?.variety}</div>
                                                          </div>
                                                      </div>
                                                  </td>
                                                  <td className="px-6 py-4 font-bold text-gray-900">{item.quantityKg} kg</td>
                                                  <td className="px-6 py-4 text-gray-700">{getOwnerName(item.ownerId)}</td>
                                                  <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                                                      <MapPin size={14}/> {item.harvestLocation || 'Australia'}
                                                  </td>
                                                  <td className="px-6 py-4 text-emerald-600 font-medium">
                                                      ${product?.defaultPricePerKg.toFixed(2)} / kg
                                                  </td>
                                                  <td className="px-6 py-4 text-right">
                                                      <button 
                                                          onClick={() => alert(`Contact request sent to ${getOwnerName(item.ownerId)} regarding ${product?.name}.`)}
                                                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 ml-auto"
                                                      >
                                                          <Phone size={14}/> Contact
                                                      </button>
                                                  </td>
                                              </tr>
                                          );
                                      })}
                                  </tbody>
                              </table>
                          )}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Freshness Details Modal (Existing) */}
      {selectedStatusItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                 onClick={() => setSelectedStatusItem(null)}
                 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                 <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Leaf size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {getProduct(selectedStatusItem.productId)?.name}
                    </h3>
                    <p className="text-sm text-gray-500">Freshness Tracker</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Harvest Date</span>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                       <Calendar size={18} className="text-emerald-500"/>
                       {formatDate(selectedStatusItem.harvestDate)}
                    </div>
                 </div>

                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Received Date</span>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                       <Truck size={18} className="text-blue-500"/>
                       {formatDate(selectedStatusItem.receivedDate)}
                    </div>
                 </div>
                 
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Expiry Date</span>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                       <Clock size={18} className="text-red-500"/>
                       {formatDate(selectedStatusItem.expiryDate)}
                    </div>
                 </div>
              </div>

              <div className="mt-6">
                 <button
                    onClick={() => setSelectedStatusItem(null)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
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
