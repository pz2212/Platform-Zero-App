
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Product, InventoryItem, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { generateSeasonalCatalog, SeasonalProduct } from '../services/geminiService';
import { ProductPricing } from './ProductPricing';
import { ShoppingCart, Search, ChevronDown, Plus, Package, Edit2, Trash2, X, Image as ImageIcon, Tag, DollarSign, Upload, LayoutGrid, Leaf, Minus, Loader2, Calendar, Clock, User as UserIcon, CreditCard, FileText, ShieldCheck, CheckCircle, ArrowRight, PartyPopper, Truck, Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MarketplaceProps {
  user: User;
}

interface ProductCardProps {
    product: Product;
    supplierName: string;
    onAdd: (qty: number) => void;
    isOutOfStock: boolean;
    cartQty: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, supplierName, onAdd, isOutOfStock, cartQty }) => {
    const [qty, setQty] = useState(1);

    const co2Savings = product.co2SavingsPerKg !== undefined 
        ? product.co2SavingsPerKg.toFixed(2) 
        : (product.name.length * 0.05 + 0.1).toFixed(1);

    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative ${isOutOfStock ? 'opacity-75' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl text-gray-900 font-bold leading-tight">{product.name}</h3>
                {isOutOfStock && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase tracking-wider whitespace-nowrap ml-2">
                        Out of Stock
                    </span>
                )}
            </div>

            <div className="text-xs space-y-1 mb-3">
                <p className="text-gray-500"><span className="text-gray-400">Category:</span> {product.category}</p>
                <p className="text-gray-500"><span className="text-gray-400">Variety:</span> {product.variety}</p>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-6">
                <Leaf size={12} className="fill-current" />
                <span>Saves {co2Savings}kg CO2/kg</span>
            </div>

            <div className="mt-auto space-y-3">
                <div className="flex gap-3 h-10">
                    <div className="w-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between px-3 text-sm text-gray-600 font-medium">
                        <span>kg</span>
                        <ChevronDown size={14} className="text-gray-400"/>
                    </div>
                    <div className="flex-1 flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button 
                            onClick={() => setQty(Math.max(1, qty - 1))} 
                            disabled={isOutOfStock}
                            className="px-3 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <Minus size={14}/>
                        </button>
                        <input 
                            className="flex-1 text-center font-bold text-sm outline-none w-full h-full bg-transparent text-gray-900" 
                            value={qty} 
                            readOnly 
                        />
                        <button 
                            onClick={() => setQty(qty + 1)} 
                            disabled={isOutOfStock}
                            className="px-3 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <Plus size={14}/>
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => { onAdd(qty); setQty(1); }}
                    disabled={isOutOfStock}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#043003] text-white hover:bg-[#064004] shadow-sm'
                    }`}
                >
                    {isOutOfStock ? 'Out of Stock' : (
                        <>
                            <Plus size={16} /> Add {qty}kg to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const navigate = useNavigate();
  
  if (user.role === UserRole.ADMIN) {
      const [allProducts, setAllProducts] = useState<Product[]>([]);
      const [isAddModalOpen, setIsAddModalOpen] = useState(false);
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      
      // AI Catalog States
      const [isGenerating, setIsGenerating] = useState(false);
      const [aiSuggestedProducts, setAiSuggestedProducts] = useState<SeasonalProduct[]>([]);
      const [showAiPreview, setShowAiPreview] = useState(false);

      const [newProduct, setNewProduct] = useState<Partial<Product>>({
          name: '',
          category: 'Vegetable',
          variety: '',
          defaultPricePerKg: 0,
          imageUrl: ''
      });

      useEffect(() => {
          refreshList();
      }, []);

      const refreshList = () => {
          const products = mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name));
          setAllProducts(products);
      };

      const handleAddProduct = async (e: React.FormEvent) => {
          e.preventDefault();
          if (newProduct.name) {
              setIsAnalyzing(true);
              let co2Val = 0;
              try {
                  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                  const prompt = `Calculate CO2e avoidance for 1kg of ${newProduct.name}. Return ONLY number.`;
                  const response = await ai.models.generateContent({
                      model: 'gemini-3-flash-preview',
                      contents: prompt
                  });
                  const match = response.text?.match(/[\d\.]+/);
                  co2Val = match ? parseFloat(match[0]) : 0.5;
              } catch (error) {
                  co2Val = 0.5;
              }

              const newId = `p-${Date.now()}`;
              mockService.addProduct({
                  id: newId,
                  name: newProduct.name!,
                  category: newProduct.category as any,
                  variety: newProduct.variety || 'Standard',
                  defaultPricePerKg: 0, 
                  imageUrl: '', 
                  co2SavingsPerKg: co2Val 
              });

              refreshList();
              setIsAnalyzing(false);
              setIsAddModalOpen(false);
              setNewProduct({ name: '', category: 'Vegetable', variety: '', defaultPricePerKg: 0, imageUrl: '' });
          }
      };

      const handleGenerateAiCatalog = async () => {
          setIsGenerating(true);
          try {
              const seasonal = await generateSeasonalCatalog();
              // Filter out duplicates (ones already in catalog)
              const existingNames = allProducts.map(p => p.name.toLowerCase());
              const uniqueSuggestions = seasonal.filter(s => !existingNames.includes(s.name.toLowerCase()));
              
              setAiSuggestedProducts(uniqueSuggestions);
              setShowAiPreview(true);
          } catch (e) {
              alert("Failed to generate AI catalog. Please ensure your API key is active.");
          } finally {
              setIsGenerating(false);
          }
      };

      const handleBulkAdd = () => {
          aiSuggestedProducts.forEach(s => {
              mockService.addProduct({
                  id: `p-ai-${Math.random().toString(36).substr(2, 9)}`,
                  name: s.name,
                  category: s.category,
                  variety: s.variety,
                  defaultPricePerKg: 0,
                  imageUrl: '',
                  co2SavingsPerKg: s.co2Savings
              });
          });
          refreshList();
          setShowAiPreview(false);
          setAiSuggestedProducts([]);
          alert(`Successfully added ${aiSuggestedProducts.length} seasonal products to the catalog!`);
      };

      const handleDeleteProduct = (id: string) => {
          if(confirm('Delete product?')) {
              mockService.deleteProduct(id);
              refreshList();
          }
      }

      return (
          <div className="space-y-8 pb-20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace Catalog</h1>
                      <p className="text-gray-500 font-medium">Manage global products visible to all wholesalers and buyers.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                        onClick={handleGenerateAiCatalog}
                        disabled={isGenerating}
                        className="bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-emerald-100 border-2 border-emerald-100 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} className="text-emerald-500"/>}
                        Generate Seasonal Catalog
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-indigo-700 shadow-md">
                        <Plus size={18}/> Add New Product
                    </button>
                  </div>
              </div>

              {/* AI SUGGESTION PREVIEW BANNER */}
              {showAiPreview && aiSuggestedProducts.length > 0 && (
                  <div className="bg-emerald-900 text-white rounded-[2rem] p-10 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform scale-150 rotate-12"><Sparkles size={200}/></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                                    <Sparkles className="text-emerald-400" size={32}/> AI Seasonal Discovery
                                </h2>
                                <p className="text-emerald-200 font-medium max-w-lg">We found {aiSuggestedProducts.length} high-demand Australian seasonal items not yet in your catalog. Sourced via Gemini Intelligence.</p>
                            </div>
                            <button onClick={() => setShowAiPreview(false)} className="text-emerald-400 hover:text-white p-2"><X size={24}/></button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                            {aiSuggestedProducts.slice(0, 10).map((p, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex flex-col justify-between h-24">
                                    <p className="font-black text-sm text-white truncate">{p.name}</p>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{p.category}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-white/60">
                                            <Leaf size={10}/> {p.co2Savings}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {aiSuggestedProducts.length > 10 && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-black text-white/40 text-xs">
                                    + {aiSuggestedProducts.length - 10} more
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleBulkAdd}
                                className="px-10 py-4 bg-emerald-400 text-emerald-950 font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-white transition-all hover:scale-105"
                            >
                                Bulk Add {aiSuggestedProducts.length} Items to Catalog
                            </button>
                            <span className="text-emerald-400/60 font-medium text-xs italic flex items-center gap-2">
                                <CheckCircle size={14}/> Varieties and CO2 impact will be auto-mapped.
                            </span>
                        </div>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full justify-between animate-in zoom-in-95 duration-200">
                          <div className="mb-6">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-black text-gray-900 text-2xl tracking-tight leading-none mb-2">{product.name}</h3>
                                  <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-widest border border-gray-50">{product.category}</span>
                              </div>
                              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest opacity-60 mb-4">{product.variety}</p>
                              {product.co2SavingsPerKg !== undefined && (
                                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
                                      <Leaf size={14} className="fill-current"/> {product.co2SavingsPerKg.toFixed(2)} kg CO2e / kg
                                  </div>
                              )}
                          </div>
                          <div className="pt-6 mt-auto border-t border-gray-50 flex justify-between items-center">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active ID: {product.id.split('-').pop()}</span>
                              <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-300 hover:text-red-500 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-all p-2 rounded-xl hover:bg-red-50"><Trash2 size={16}/> Remove</button>
                          </div>
                      </div>
                  ))}
                  <button onClick={() => setIsAddModalOpen(true)} className="border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center h-full min-h-[220px] hover:bg-gray-50 hover:border-indigo-200 transition-all group p-10">
                      <div className="bg-white p-5 rounded-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform border border-gray-100"><Plus size={32} className="text-gray-300 group-hover:text-indigo-600"/></div>
                      <span className="font-black text-gray-400 uppercase tracking-[0.2em] text-xs group-hover:text-indigo-600">Manual Entry</span>
                  </button>
              </div>

              {isAddModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white"><h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Manual Product Entry</h2><button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button></div>
                          <form onSubmit={handleAddProduct} className="p-8 space-y-6">
                              <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label><input required type="text" className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-900 font-bold bg-gray-50" placeholder="e.g. Romanesco Broccoli" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
                              <div className="grid grid-cols-2 gap-6">
                                  <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label><div className="relative"><LayoutGrid size={18} className="absolute left-4 top-4 text-gray-400"/><select className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none bg-gray-50 font-bold text-gray-900 appearance-none" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value as any})}><option value="Vegetable">Vegetable</option><option value="Fruit">Fruit</option></select><ChevronDown size={16} className="absolute right-4 top-4.5 text-gray-400 pointer-events-none"/></div></div>
                                  <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Variety</label><div className="relative"><Tag size={18} className="absolute left-4 top-4 text-gray-400"/><input type="text" className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-900 bg-gray-50" placeholder="e.g. Green" value={newProduct.variety} onChange={(e) => setNewProduct({...newProduct, variety: e.target.value})} /></div></div>
                              </div>
                              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100"><button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 text-gray-500 font-black uppercase text-xs tracking-widest hover:bg-gray-50 rounded-xl transition-all">Cancel</button><button type="submit" disabled={isAnalyzing} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">{isAnalyzing ? <><Loader2 size={18} className="animate-spin"/> Scanning Impact...</> : <><Check size={18}/> Save to Catalog</>}</button></div>
                          </form>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  if (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) return <ProductPricing user={user} />;

  const [products, setProducts] = useState<Product[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [alphaFilter, setAlphaFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [connectedSupplierName, setConnectedSupplierName] = useState('');
  const [connectedSupplierId, setConnectedSupplierId] = useState('');
  
  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ deliveryDate: '', deliveryTime: '', contactName: '', paymentMethod: 'invoice' as 'pay_now' | 'invoice' | 'amex' });

  useEffect(() => {
    setProducts(mockService.getAllProducts().sort((a, b) => a.name.localeCompare(b.name)));
    setAllInventory(mockService.getAllInventory());
    const customer = mockService.getCustomers().find(c => c.id === user.id); 
    setConnectedSupplierName(customer?.connectedSupplierName || 'Partner Network');
    setConnectedSupplierId(customer?.connectedSupplierId || '');
    if (customer && customer.contactName && !checkoutForm.contactName) {
        setCheckoutForm(prev => ({...prev, contactName: customer.contactName}));
    }
  }, [user]);

  const ALPHABET_GROUPS = [{ label: 'All', regex: null }, { label: 'ABC', regex: /^[A-C]/i }, { label: 'DEF', regex: /^[D-F]/i }, { label: 'GHI', regex: /^[G-I]/i }, { label: 'JKL', regex: /^[J-L]/i }, { label: 'MNO', regex: /^[M-O]/i }, { label: 'PQR', regex: /^[P-R]/i }, { label: 'STU', regex: /^[S-U]/i }, { label: 'VWX', regex: /^[V-X]/i }, { label: 'YZ', regex: /^[Y-Z]/i }];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesAlpha = true;
    const activeGroup = ALPHABET_GROUPS.find(g => g.label === alphaFilter);
    if (activeGroup && activeGroup.regex) matchesAlpha = activeGroup.regex.test(p.name);
    return matchesSearch && matchesAlpha;
  });

  const addToCart = (product: Product, qty: number) => {
      setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + qty }));
  };

  const handlePlaceOrder = () => {
      if (!checkoutForm.deliveryDate || !checkoutForm.deliveryTime || !checkoutForm.contactName) {
          alert("Please fill in all delivery details.");
          return;
      }

      const cartItems = Object.entries(cart).map(([id, qty]) => ({
          product: products.find(p => p.id === id)!,
          qty: qty as number
      })).filter(i => i.product);

      if (cartItems.length === 0) return;

      // WORKFLOW REQUIREMENT: Send strictly to the CONNECTED supplier
      let finalSellerId = connectedSupplierId;
      if (!finalSellerId) {
          finalSellerId = allInventory.find(i => i.productId === cartItems[0]?.product.id)?.ownerId || 'u2'; 
      }

      mockService.createMarketplaceOrder(
          user.id, 
          finalSellerId, 
          cartItems, 
          { 
            deliveryDate: checkoutForm.deliveryDate, 
            deliveryTime: checkoutForm.deliveryTime, 
            contactName: checkoutForm.contactName, 
            deliveryLocation: 'Registered Address' 
          },
          checkoutForm.paymentMethod
      );

      // Trigger Success View
      setIsOrderSuccessful(true);
      setCart({});
  };

  const calculateCartTotal = () => {
      let subtotal = 0;
      Object.entries(cart).forEach(([id, qty]) => {
          const product = products.find(p => p.id === id);
          if (product) subtotal += product.defaultPricePerKg * (qty as number);
      });
      return subtotal;
  };

  const subtotal = calculateCartTotal();
  const discount = checkoutForm.paymentMethod === 'pay_now' ? subtotal * 0.10 : 0;
  const total = subtotal - discount;

  return (
    <div className="space-y-8 relative pb-20">
        <div className="flex items-center gap-3 mb-2"><ShoppingCart size={28} className="text-gray-900"/><h1 className="text-2xl font-bold text-gray-900">Order Now</h1></div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-wrap gap-2">
                {ALPHABET_GROUPS.map(group => (
                    <button key={group.label} onClick={() => setAlphaFilter(group.label)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase border ${alphaFilter === group.label ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>{group.label}</button>
                ))}
            </div>
            <div className="relative w-full md:w-64"><Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-300 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300"><p>No products found.</p></div> : filteredProducts.map(product => {
                    const isAvailable = allInventory.some(i => i.productId === product.id && i.quantityKg > 0 && i.status === 'Available');
                    return <ProductCard key={product.id} product={product} supplierName={connectedSupplierName} onAdd={(qty) => addToCart(product, qty)} isOutOfStock={!isAvailable} cartQty={cart[product.id] || 0} />;
                })
            }
        </div>
        
        {Object.keys(cart).length > 0 && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in">
                <button onClick={() => { setIsOrderSuccessful(false); setIsCheckoutOpen(true); }} className="bg-[#0F172A] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"><div className="relative"><ShoppingCart size={24} /><span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0F172A]">{Object.keys(cart).length}</span></div><div className="text-left"><span className="block text-xs text-gray-400 font-bold uppercase">Total</span><span className="font-bold text-lg leading-none">Checkout</span></div></button>
            </div>
        )}

        {isCheckoutOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
                    
                    {!isOrderSuccessful ? (
                        <>
                            {/* Standard Checkout Form */}
                            <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ShoppingCart size={20}/> Order Summary</h2>
                                <div className="space-y-3 mb-6">
                                    {Object.entries(cart).map(([id, qty]) => {
                                        const quantity = qty as number;
                                        const product = products.find(p => p.id === id);
                                        if(!product) return null;
                                        return (
                                            <div key={id} className="flex justify-between items-start text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-gray-500 text-xs">{quantity}kg @ ${product.defaultPricePerKg.toFixed(2)}</p>
                                                </div>
                                                <p className="font-medium text-gray-900">${(product.defaultPricePerKg * quantity).toFixed(2)}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                    {discount > 0 && <div className="flex justify-between text-sm text-emerald-600 font-medium"><span>Discount (10%)</span><span>-${discount.toFixed(2)}</span></div>}
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
                                </div>
                            </div>
                            <div className="w-full md:w-2/3 p-6 overflow-y-auto flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Checkout Details</h2>
                                    <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                                </div>
                                <div className="space-y-6 flex-1">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Delivery Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                                                <div className="relative">
                                                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400"/>
                                                    <input type="date" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-emerald-500 outline-none border-gray-300" value={checkoutForm.deliveryDate} onChange={e => setCheckoutForm({...checkoutForm, deliveryDate: e.target.value})} min={new Date().toISOString().split('T')[0]}/>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                                                <div className="relative">
                                                    <Clock size={16} className="absolute left-3 top-3 text-gray-400"/>
                                                    <input type="time" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-emerald-500 outline-none border-gray-300" value={checkoutForm.deliveryTime} onChange={e => setCheckoutForm({...checkoutForm, deliveryTime: e.target.value})}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Who made the order?</label>
                                            <div className="relative">
                                                <UserIcon size={16} className="absolute left-3 top-3 text-gray-400"/>
                                                <input type="text" placeholder="Contact Name" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-emerald-500 outline-none border-gray-300" value={checkoutForm.contactName} onChange={e => setCheckoutForm({...checkoutForm, contactName: e.target.value})}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Payment Method</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'pay_now' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input type="radio" name="payment" className="mt-1 w-4 h-4 text-emerald-600" checked={checkoutForm.paymentMethod === 'pay_now'} onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'pay_now'})}/>
                                                <div className="flex-1">
                                                    <div className="flex justify-between"><span className="font-bold text-gray-900">Pay Now</span><span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Save 10%</span></div>
                                                    <p className="text-sm text-gray-500 mt-1">Instant credit card payment.</p>
                                                </div>
                                            </label>
                                            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'invoice' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input type="radio" name="payment" className="mt-1 w-4 h-4 text-emerald-600" checked={checkoutForm.paymentMethod === 'invoice'} onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'invoice'})}/>
                                                <div className="flex-1">
                                                    <span className="font-bold text-gray-900">Invoice</span>
                                                    <p className="text-sm text-gray-500 mt-1">Standard 7-day terms.</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-3">
                                    <button onClick={() => setIsCheckoutOpen(false)} className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                    <button onClick={handlePlaceOrder} className="px-8 py-3 bg-[#043003] text-white rounded-lg font-bold hover:bg-[#064004] shadow-lg flex items-center gap-2 transition-all">
                                        <CheckCircle size={20}/> Place Order
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* THANK YOU SCREEN */
                        <div className="w-full bg-white p-12 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8 relative">
                                <PartyPopper size={48} />
                                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-emerald-100">
                                    <CheckCircle size={24} className="fill-emerald-500 text-white" />
                                </div>
                            </div>
                            
                            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Order Received!</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                                Thank you for your purchase. We've triggered the Platform Zero marketplace workflow for your account.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
                                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 text-left flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-600"><Truck size={24}/></div>
                                    <div>
                                        <p className="font-bold text-emerald-900">Partner Notified</p>
                                        <p className="text-xs text-emerald-700 mt-1">Order sent to {connectedSupplierName} for fulfillment.</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-left flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600"><FileText size={24}/></div>
                                    <div>
                                        <p className="font-bold text-blue-900">Accounts Categorized</p>
                                        <p className="text-xs text-blue-700 mt-1">Invoice added to your "Bills to Pay" in Accounts.</p>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 text-left flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-purple-600"><Leaf size={24}/></div>
                                    <div>
                                        <p className="font-bold text-purple-900">Impact Report Ready</p>
                                        <p className="text-xs text-purple-700 mt-1">Real-time CO2 savings calculated in Order History.</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-slate-600"><ShieldCheck size={24}/></div>
                                    <div>
                                        <p className="font-bold text-slate-900">Admin Synced</p>
                                        <p className="text-xs text-slate-700 mt-1">Platform Zero Admin monitoring fulfillment & quality.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => { setIsCheckoutOpen(false); setIsOrderSuccessful(false); }}
                                    className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-lg"
                                >
                                    Back to Catalog
                                </button>
                                <button 
                                    onClick={() => { 
                                        setIsCheckoutOpen(false); 
                                        setIsOrderSuccessful(false); 
                                        navigate('/orders'); 
                                    }}
                                    className="px-8 py-4 bg-[#043003] text-white font-bold rounded-xl hover:bg-[#064004] shadow-xl hover:-translate-y-1 transition-all text-lg flex items-center gap-2"
                                >
                                    View Order History <ArrowRight size={20}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};
