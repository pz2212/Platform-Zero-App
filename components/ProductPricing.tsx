
import React, { useState, useEffect, useRef } from 'react';
import { Product, PricingRule, BusinessCategory, User, InventoryItem, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { SellProductDialog } from './SellProductDialog';
import { ShareModal } from './SellerDashboardV1';
import { 
  Tag, Edit2, Check, X, DollarSign, Percent, MapPin, Calendar, 
  User as UserIcon, Truck, MoreVertical, Trash2, ShoppingBag, 
  Share2, PackagePlus, Heart, LayoutTemplate, Save, ChevronDown, Filter, AlertCircle, CheckCircle, Plus, Camera, UploadCloud, Loader2
} from 'lucide-react';

interface ProductPricingProps {
  user: User;
}

const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Cafe',
  'Restaurant',
  'Pub',
  'Food Manufacturer'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AddInventoryModal = ({ isOpen, onClose, user, products, onComplete }: { 
    isOpen: boolean, 
    onClose: () => void, 
    user: User, 
    products: Product[],
    onComplete: () => void 
}) => {
    const [image, setImage] = useState<string | null>(null);
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [harvestLocation, setHarvestLocation] = useState('');
    const [farmerName, setFarmerName] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [discountAfterDays, setDiscountAfterDays] = useState('3');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !quantity || !price) {
            alert("Please fill in Product, Quantity, and Price.");
            return;
        }

        setIsSubmitting(true);
        
        const newItem: InventoryItem = {
            id: `inv-${Date.now()}`,
            productId,
            ownerId: user.id,
            quantityKg: parseFloat(quantity),
            harvestLocation,
            originalFarmerName: farmerName,
            status: 'Available',
            harvestDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            discountAfterDays: parseInt(discountAfterDays),
            discountPricePerKg: discountPrice ? parseFloat(discountPrice) : undefined,
            batchImageUrl: image || undefined
        };

        mockService.addInventoryItem(newItem);
        mockService.updateProductPrice(productId, parseFloat(price));

        setTimeout(() => {
            setIsSubmitting(false);
            onComplete();
            onClose();
            alert("Inventory added successfully!");
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Add New Inventory</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT: PHOTO UPLOAD */}
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Product Batch Photo</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${image ? 'border-emerald-500' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                            >
                                {image ? (
                                    <img src={image} className="w-full h-full object-cover" alt="Preview"/>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                                            <Camera size={24}/>
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">Upload Photo</p>
                                        <p className="text-xs text-gray-400 mt-1">Snap a photo of the stock</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        {/* RIGHT: CORE DETAILS */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Select Product</label>
                                <select 
                                    required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={productId}
                                    onChange={e => setProductId(e.target.value)}
                                >
                                    <option value="">Choose product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.variety})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Quantity (kg)</label>
                                    <input 
                                        type="number" required placeholder="0"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={quantity} onChange={e => setQuantity(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Price ($/kg)</label>
                                    <input 
                                        type="number" required step="0.01" placeholder="0.00"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={price} onChange={e => setPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Harvest Location</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input 
                                        type="text" placeholder="e.g. Mildura, VIC"
                                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={harvestLocation} onChange={e => setHarvestLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Farmer / Source</label>
                                <div className="relative">
                                    <UserIcon size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input 
                                        type="text" placeholder="e.g. Green Valley Farms"
                                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={farmerName} onChange={e => setFarmerName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DISCOUNT SECTION */}
                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-[0.2em]">
                            <Tag size={16}/> Automatic Discount Rules
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Discount Price ($/kg)</label>
                                <input 
                                    type="number" step="0.01" placeholder="e.g. 3.50"
                                    className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={discountPrice} onChange={e => setDiscountPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Active After (Days)</label>
                                <input 
                                    type="number" placeholder="3"
                                    className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={discountAfterDays} onChange={e => setDiscountAfterDays(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-medium italic">Help reduce waste by automatically lowering the price as expiry approaches.</p>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#043003] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-100 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><PackagePlus size={20}/> Add stock to catalog</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const ProductPricing: React.FC<ProductPricingProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAddInvModalOpen, setIsAddInvModalOpen] = useState(false);
  const [productToSell, setProductToSell] = useState<Product | null>(null);
  const [itemToSell, setItemToSell] = useState<InventoryItem | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<InventoryItem | null>(null);

  const [rules, setRules] = useState<PricingRule[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | 'FREQUENT'>('FREQUENT');
  
  // Daily Verification State
  const [verificationMode, setVerificationMode] = useState<Record<string, 'initial' | 'edit' | 'verified'>>({});
  const [verificationPrices, setVerificationPrices] = useState<Record<string, number>>({});

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const fetchData = () => {
      const allProducts = mockService.getAllProducts();
      const myInventory = mockService.getInventory(user.id).filter(i => i.ownerId === user.id);
      setProducts(allProducts);
      setInventory(myInventory);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    const existingRules = mockService.getPricingRules(user.id, product.id);
    const initializedRules: PricingRule[] = BUSINESS_CATEGORIES.map(category => {
      const existing = existingRules.find(r => r.category === category);
      return existing || {
        id: Math.random().toString(36).substr(2, 9),
        ownerId: user.id,
        productId: product.id,
        category,
        strategy: 'PERCENTAGE_DISCOUNT',
        value: 0,
        isActive: false
      };
    });
    setRules(initializedRules);
  };

  const handleSave = () => {
    mockService.savePricingRules(rules);
    setSelectedProduct(null);
  };

  const toggleMenu = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === productId ? null : productId);
  };

  const handleMenuAction = (e: React.MouseEvent, action: string, product: Product) => {
    e.stopPropagation();
    setActiveMenuId(null);
    switch(action) {
        case 'Edit': handleProductClick(product); break;
        case 'Delete': 
            if(confirm(`Delete ${product.name}?`)) alert("Deleted"); 
            break;
        case 'Sell': 
            const sellItem = inventory.find(i => i.productId === product.id && i.status === 'Available');
            if (sellItem) {
                setItemToSell(sellItem);
                setProductToSell(product);
                setIsSellModalOpen(true);
            } else {
                alert("Cannot sell: No available stock for this product.");
            }
            break;
        case 'Share':
            const shareItem = inventory.find(i => i.productId === product.id && i.status === 'Available');
            if (shareItem) {
                setItemToShare(shareItem);
                setIsShareModalOpen(true);
            } else {
                alert("Cannot share: No available stock for this product.");
            }
            break;
    }
  };

  const handleSellComplete = (data: any) => {
    if (!itemToSell) return;
    let customerId = data.customer.id;
    let customerName = data.customer.businessName || 'Customer';
    if (data.customer.isNew) {
        const newCustomer = {
            id: `c-new-${Date.now()}`,
            businessName: data.customer.businessName,
            contactName: data.customer.contactName,
            email: data.customer.email,
            phone: data.customer.mobile,
            category: 'Restaurant',
            connectionStatus: 'Active',
            connectedSupplierName: user.businessName,
            connectedSupplierId: user.id
        };
        mockService.addMarketplaceCustomer(newCustomer as any);
        customerId = newCustomer.id;
    }
    if (data.action === 'QUOTE') {
         alert(`Quote Sent to ${customerName}!`);
    } else {
         mockService.createInstantOrder(customerId, itemToSell, data.quantity, data.pricePerKg);
         alert(`Sale Recorded!`);
    }
    setIsSellModalOpen(false);
    setItemToSell(null);
    setProductToSell(null);
  };

  // Daily Verification Logic
  const handleVerifyPrice = (invId: string, changed: boolean, currentPrice: number) => {
      if (changed) {
          setVerificationMode(prev => ({ ...prev, [invId]: 'edit' }));
          setVerificationPrices(prev => ({ ...prev, [invId]: currentPrice }));
      } else {
          mockService.verifyPrice(invId);
          fetchData();
          setVerificationMode(prev => ({ ...prev, [invId]: 'verified' }));
      }
  };

  const handleSubmitPriceChange = (invId: string) => {
      const newPrice = verificationPrices[invId];
      mockService.verifyPrice(invId, newPrice);
      fetchData();
      setVerificationMode(prev => ({ ...prev, [invId]: 'verified' }));
      alert("Price updated and verified for today.");
  };

  const displayedProducts = activeFilter === 'FREQUENT' 
    ? products.slice(0, 12) 
    : products.filter(p => p.name.toUpperCase().startsWith(activeFilter));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Price</h1>
          <p className="text-gray-500">Manage your listed products and customer-specific pricing.</p>
        </div>
        <button 
            onClick={() => setIsAddInvModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#043003] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all hover:scale-105 active:scale-95"
        >
            <Plus size={18}/> Add Inventory
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2 items-center justify-start">
             <button
                onClick={() => setActiveFilter('FREQUENT')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeFilter === 'FREQUENT' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
             >
                Most Frequent
             </button>
             <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
             {ALPHABET.map(letter => {
                 const hasProducts = products.some(p => p.name.toUpperCase().startsWith(letter));
                 return (
                    <button
                        key={letter}
                        onClick={() => hasProducts && setActiveFilter(letter)}
                        disabled={!hasProducts}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${activeFilter === letter ? 'bg-emerald-600 text-white shadow-md' : hasProducts ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100' : 'text-gray-300 cursor-not-allowed bg-gray-50/50'}`}
                    >
                        {letter}
                    </button>
                 );
             })}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map(product => {
            const myInv = inventory.find(i => i.productId === product.id && i.status === 'Available');
            const hasStock = !!myInv;
            const isVerifiedToday = myInv?.lastPriceVerifiedDate === new Date().toLocaleDateString();
            const mode = verificationMode[myInv?.id || ''] || (isVerifiedToday ? 'verified' : 'initial');

            return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-all group relative flex flex-col">
                <div className="absolute top-3 right-3 z-20">
                    <button onClick={(e) => toggleMenu(e, product.id)} className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 shadow-sm border border-gray-100">
                        <MoreVertical size={18} />
                    </button>
                    {activeMenuId === product.id && (
                        <div ref={menuRef} className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-30 overflow-hidden">
                            <button onClick={(e) => handleMenuAction(e, 'Edit', product)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                                <Edit2 size={16} className="text-gray-400" /> Edit
                            </button>
                            <button onClick={(e) => handleMenuAction(e, 'Share', product)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                                <Share2 size={16} className="text-gray-400" /> Share
                            </button>
                            <button onClick={(e) => handleMenuAction(e, 'Sell', product)} className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                                <ShoppingBag size={16} /> Sell Now
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-2 pr-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.variety}</p>
                        </div>
                        {!hasStock && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase tracking-wide">No Stock</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg text-sm border border-emerald-100">${product.defaultPricePerKg.toFixed(2)} / kg</span>
                    </div>

                    {/* DAILY PRICE VERIFICATION UI */}
                    {hasStock && (
                        <div className="mt-6 pt-4 border-t border-gray-50">
                            {mode === 'verified' ? (
                                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-in fade-in zoom-in-95">
                                    <CheckCircle size={16}/> Price Verified for Today
                                </div>
                            ) : mode === 'edit' ? (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Update Price ($/kg)</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number"
                                            step="0.01"
                                            className="flex-1 p-2 border border-emerald-300 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={verificationPrices[myInv.id] || ''}
                                            onChange={(e) => setVerificationPrices(prev => ({ ...prev, [myInv.id]: parseFloat(e.target.value) }))}
                                            autoFocus
                                        />
                                        <button 
                                            onClick={() => handleSubmitPriceChange(myInv.id)}
                                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                                        <AlertCircle size={14} className="text-orange-400"/> Price changed today?
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleVerifyPrice(myInv.id, true, product.defaultPricePerKg)}
                                            className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            Yes
                                        </button>
                                        <button 
                                            onClick={() => handleVerifyPrice(myInv.id, false, product.defaultPricePerKg)}
                                            className="flex-1 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div 
                    onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                    className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium hover:text-gray-600 cursor-pointer transition-colors"
                >
                    <span>Manage Category Pricing</span>
                    <ChevronDown size={14} className="-rotate-90"/>
                </div>
            </div>
            );
        })}
      </div>

      {/* DIALOGS */}
      {isSellModalOpen && productToSell && (
          <SellProductDialog 
              isOpen={isSellModalOpen}
              onClose={() => setIsSellModalOpen(false)}
              product={productToSell}
              onComplete={handleSellComplete}
          />
      )}

      {isShareModalOpen && itemToShare && (
          <ShareModal 
              item={itemToShare}
              onClose={() => setIsShareModalOpen(false)}
              onComplete={() => setIsShareModalOpen(false)}
              currentUser={user}
          />
      )}

      <AddInventoryModal 
          isOpen={isAddInvModalOpen}
          onClose={() => setIsAddInvModalOpen(false)}
          user={user}
          products={products}
          onComplete={fetchData}
      />
    </div>
  );
};
