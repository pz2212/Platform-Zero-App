import React, { useState, useEffect, useRef } from 'react';
import { Product, PricingRule, BusinessCategory, User, InventoryItem, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { SellProductDialog } from './SellProductDialog';
import { ShareModal } from './SellerDashboardV1';
import { 
  Tag, Edit2, Check, X, DollarSign, MapPin, 
  User as UserIcon, MoreVertical, ShoppingBag, 
  Share2, PackagePlus, Save, ChevronDown, AlertCircle, CheckCircle, Plus, Camera, Loader2
} from 'lucide-react';

interface ProductPricingProps {
  user: User;
}

const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Cafe',
  'Restaurant',
  'Pub',
  'Grocery store'
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
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Batch Photo</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${image ? 'border-emerald-500' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                            >
                                {image ? (<img src={image} className="w-full h-full object-cover" />) : (
                                    <div className="text-center p-4">
                                        <Camera size={24} className="mx-auto mb-2 text-gray-300"/>
                                        <p className="text-sm font-bold text-gray-700">Upload Photo</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Product</label>
                                <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={productId} onChange={e => setProductId(e.target.value)}>
                                    <option value="">Choose product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" required placeholder="Qty (kg)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={quantity} onChange={e => setQuantity(e.target.value)} />
                                <input type="number" required step="0.01" placeholder="Price ($)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <input type="text" placeholder="Harvest Location" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={harvestLocation} onChange={e => setHarvestLocation(e.target.value)} />
                            <input type="text" placeholder="Farmer / Source" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" value={farmerName} onChange={e => setFarmerName(e.target.value)} />
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#043003] text-white rounded-2xl font-black uppercase text-sm shadow-xl flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><PackagePlus size={20}/> Add to catalog</>}
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
  
  const [verificationMode, setVerificationMode] = useState<Record<string, 'initial' | 'edit' | 'verified'>>({});
  const [verificationPrices, setVerificationPrices] = useState<Record<string, number>>({});

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const fetchData = () => {
      setProducts(mockService.getAllProducts());
      setInventory(mockService.getInventory(user.id).filter(i => i.ownerId === user.id));
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

  const handleMenuAction = (e: React.MouseEvent, action: string, product: Product) => {
    e.stopPropagation();
    setActiveMenuId(null);
    switch(action) {
        case 'Edit': handleProductClick(product); break;
        case 'Sell': 
            const sellItem = inventory.find(i => i.productId === product.id && i.status === 'Available');
            if (sellItem) {
                setItemToSell(sellItem);
                setProductToSell(product);
                setIsSellModalOpen(true);
            } else alert("No stock available.");
            break;
        case 'Share':
            const shareItem = inventory.find(i => i.productId === product.id && i.status === 'Available');
            if (shareItem) {
                setItemToShare(shareItem);
                setIsShareModalOpen(true);
            } else alert("No stock available.");
            break;
    }
  };

  const displayedProducts = activeFilter === 'FREQUENT' 
    ? products.slice(0, 12) 
    : products.filter(p => p.name.toUpperCase().startsWith(activeFilter));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Price</h1>
          <p className="text-gray-500">Manage products and specific pricing.</p>
        </div>
        <button onClick={() => setIsAddInvModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-[#043003] text-white rounded-xl font-black uppercase text-xs shadow-lg">
            <Plus size={18}/> Add Inventory
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
             <button onClick={() => setActiveFilter('FREQUENT')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeFilter === 'FREQUENT' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600'}`}>Frequent</button>
             {ALPHABET.map(letter => {
                 const hasProducts = products.some(p => p.name.toUpperCase().startsWith(letter));
                 return (<button key={letter} onClick={() => hasProducts && setActiveFilter(letter)} disabled={!hasProducts} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${activeFilter === letter ? 'bg-emerald-600 text-white' : hasProducts ? 'bg-white text-gray-700 border' : 'text-gray-300 cursor-not-allowed'}`}>{letter}</button>);
             })}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map(product => {
            const myInv = inventory.find(i => i.productId === product.id && i.status === 'Available');
            const hasStock = !!myInv;
            const mode = verificationMode[myInv?.id || ''] || (myInv?.lastPriceVerifiedDate === new Date().toLocaleDateString() ? 'verified' : 'initial');

            return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-all group flex flex-col">
                <div className="absolute top-3 right-3 z-20">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === product.id ? null : product.id); }} className="p-1.5 rounded-full bg-white/80 border text-gray-500"><MoreVertical size={18} /></button>
                    {activeMenuId === product.id && (
                        <div ref={menuRef} className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-xl border z-30 py-1">
                            <button onClick={(e) => handleMenuAction(e, 'Edit', product)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Edit</button>
                            <button onClick={(e) => handleMenuAction(e, 'Share', product)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Share</button>
                            <button onClick={(e) => handleMenuAction(e, 'Sell', product)} className="w-full text-left px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50">Sell Now</button>
                        </div>
                    )}
                </div>
                
                <div className="p-5 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.variety}</p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg text-sm border border-emerald-100">${product.defaultPricePerKg.toFixed(2)} / kg</span>
                    </div>
                </div>
                <div onClick={() => handleProductClick(product)} className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-400 font-medium hover:text-gray-600 cursor-pointer flex justify-between">
                    <span>Manage Categories</span><ChevronDown size={14} className="-rotate-90"/>
                </div>
            </div>
            );
        })}
      </div>

      <AddInventoryModal isOpen={isAddInvModalOpen} onClose={() => setIsAddInvModalOpen(false)} user={user} products={products} onComplete={fetchData} />
    </div>
  );
};