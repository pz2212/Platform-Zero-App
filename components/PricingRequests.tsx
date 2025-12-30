
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Product, UserRole, SupplierPriceRequest, SupplierPriceRequestItem, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { extractInvoiceItems } from '../services/geminiService';
import { 
  Calculator, Download, Mail, Building, TrendingDown, 
  FileText, Upload, X, Loader2, Eye, EyeOff, Send, CheckCircle, MapPin, Handshake, ChevronRight, UserPlus, DollarSign, Clock,
  Store, ChevronDown, Info, Check, MessageSquare, Rocket, FilePlus
} from 'lucide-react';

interface PricingRequestsProps {
  user: User;
}

interface ComparisonItem {
  product: Product;
  invoicePrice: number;    
  pzPrice: number;         
  supplierTargetPrice: number; 
  savingsPercent: number;
}

export const PricingRequests: React.FC<PricingRequestsProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { customerName?: string, customerLocation?: string, invoiceFile?: string, weeklySpend?: number, orderFreq?: string } || {};

  // Configuration State
  const [customerName, setCustomerName] = useState(state.customerName || '');
  const [customerLocation, setCustomerLocation] = useState(state.customerLocation || '');
  const [invoiceFile, setInvoiceFile] = useState<File | string | null>(state.invoiceFile || null);
  const [invoiceFileName, setInvoiceFileName] = useState<string>(state.invoiceFile ? 'Attached from Lead Record' : '');
  
  // Stats Fields
  const [weeklySpend, setWeeklySpend] = useState<number | string>(state.weeklySpend || '');
  const [orderFreq, setOrderFreq] = useState<string>(state.orderFreq || 'Weekly');

  // Settings
  const [targetSavings, setTargetSavings] = useState<number>(30); 
  const [supplierTarget, setSupplierTarget] = useState<number>(35); 
  const [showSupplierTargets, setShowSupplierTargets] = useState(false);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  
  // UI State
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Supplier Request Modal & Custom Dropdown State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(mockService.getAllProducts());
    setWholesalers(mockService.getWholesalers());

    if (state.invoiceFile && !isGenerated && !isProcessing) {
        handleGenerate();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
      setInvoiceFileName(e.target.files[0].name);
      setIsGenerated(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          setInvoiceFile(e.dataTransfer.files[0]);
          setInvoiceFileName(e.dataTransfer.files[0].name);
          setIsGenerated(false);
      }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInvoiceFile(null);
    setInvoiceFileName('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);

    try {
        let items: ComparisonItem[] = [];
        const demoItems = [
            { name: 'Bell Peppers', price: 15.20 },
            { name: 'Premium Tomatoes', price: 9.90 },
            { name: 'Eggplant', price: 11.80 },
            { name: 'Oranges', price: 4.20 },
            { name: 'Organic Asparagus', price: 26.80 }
        ];

        if (invoiceFile) {
             let base64 = '';
             let mimeType = 'application/pdf'; 

             if (invoiceFile instanceof File) {
                 const reader = new FileReader();
                 const base64Promise = new Promise<string>((resolve) => {
                     reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                     reader.readAsDataURL(invoiceFile);
                 });
                 base64 = await base64Promise;
                 mimeType = invoiceFile.type;
             } else if (typeof invoiceFile === 'string') {
                 if (invoiceFile.startsWith('data:')) {
                     const parts = invoiceFile.split(',');
                     const meta = parts[0].split(':')[1];
                     if (meta) {
                         mimeType = meta.split(';')[0];
                     }
                     base64 = parts[1];
                 } else {
                     base64 = invoiceFile;
                 }
             }
             
             if (base64) {
                 const aiItems = await extractInvoiceItems(base64, mimeType);
                 
                 if (aiItems && aiItems.length > 0) {
                     items = aiItems.map(aiItem => {
                         const existing = products.find(p => 
                             p.name.toLowerCase().includes(aiItem.name.toLowerCase()) || 
                             aiItem.name.toLowerCase().includes(p.name.toLowerCase())
                         );
                         
                         const product: Product = existing || {
                             id: `temp-${Math.random()}`,
                             name: aiItem.name,
                             category: 'Vegetable',
                             variety: 'Standard',
                             imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=100&h=100',
                             defaultPricePerKg: aiItem.pzRate
                         };

                         const invoicePrice = aiItem.marketRate;
                         const pzPrice = invoicePrice * (1 - (targetSavings / 100));
                         const supplierTargetPrice = invoicePrice * (1 - (supplierTarget / 100));

                         return {
                             product,
                             invoicePrice,
                             pzPrice,
                             supplierTargetPrice,
                             savingsPercent: targetSavings
                         };
                     });
                 }
             }
        }

        if (items.length === 0) {
             if (!invoiceFile) await new Promise(resolve => setTimeout(resolve, 1500));

             items = demoItems.map(d => {
                 const existing = products.find(p => p.name.includes(d.name.split(' ')[1]) || p.name === d.name);
                 const product = existing || products[0];
                 
                 const invoicePrice = d.price;
                 const pzPrice = invoicePrice * (1 - (targetSavings / 100));
                 const supplierTargetPrice = invoicePrice * (1 - (supplierTarget / 100));

                 return {
                     product: { ...product, name: d.name },
                     invoicePrice,
                     pzPrice,
                     supplierTargetPrice,
                     savingsPercent: targetSavings
                 };
             });
        }

        setComparison(items);
        setIsGenerated(true);
    } catch (error) {
        console.error("Analysis failed", error);
    } finally {
        setIsProcessing(false);
    }
  };

  const totalInvoiceSpend = comparison.reduce((sum, item) => sum + item.invoicePrice, 0);
  const totalPzSpend = comparison.reduce((sum, item) => sum + item.pzPrice, 0);
  const totalSavingsValue = totalInvoiceSpend - totalPzSpend;
  const actualSavingsPercent = totalInvoiceSpend > 0 ? (totalSavingsValue / totalInvoiceSpend) * 100 : 0;

  const handleExportPDF = () => {
      alert("PDF Exported!");
  };

  const handleOpenSupplierModal = () => {
      setIsSupplierModalOpen(true);
  };

  const handleSendSupplierRequest = () => {
      if (!selectedSupplierId) return;

      const items: SupplierPriceRequestItem[] = comparison.map(c => ({
          productId: c.product.id,
          productName: c.product.name,
          targetPrice: parseFloat(c.supplierTargetPrice.toFixed(2))
      }));

      const newRequest: SupplierPriceRequest = {
          id: `req-${Date.now()}`,
          supplierId: selectedSupplierId,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          customerContext: customerName ? customerName : 'New Customer Pricing',
          customerLocation: customerLocation || 'Unknown Location',
          items: items
      };

      mockService.createSupplierPriceRequest(newRequest);
      
      const supplierName = wholesalers.find(w => w.id === selectedSupplierId)?.businessName;
      alert(`Request successfully sent to ${supplierName}! Track progress in the "Price Requests" tab.`);
      
      setIsGenerated(false);
      setComparison([]);
      setCustomerName('');
      setCustomerLocation('');
      setInvoiceFile(null);
      setInvoiceFileName('');
      setIsSupplierModalOpen(false);
      setSelectedSupplierId('');
  };

  const selectedSupplier = wholesalers.find(w => w.id === selectedSupplierId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Calculator size={32} className="text-indigo-600"/> Quote Generator
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Extract invoice items and generate competitive platform quotes.</p>
        </div>
        {isGenerated && (
             <div className="flex gap-2">
                <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 shadow-sm">
                    <CheckCircle size={14}/> {comparison.length} Items Analysed
                </span>
             </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: CALCULATOR & SUMMARY */}
        <div className="w-full lg:w-1/3 space-y-6">
            
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <h2 className="font-black text-gray-900 mb-8 flex items-center gap-2 text-xl uppercase tracking-tight">
                    Lead Config
                </h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Business / Customer</label>
                        <div className="relative">
                            <Building size={18} className="absolute left-4 top-4 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="Business Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Market Location</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-4 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="e.g. Richmond, VIC"
                                value={customerLocation}
                                onChange={(e) => setCustomerLocation(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Weekly Spend</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-4 top-4 text-gray-400"/>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={weeklySpend}
                                    onChange={(e) => setWeeklySpend(parseFloat(e.target.value) || '')}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Freq</label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-4 top-4 text-gray-400 pointer-events-none"/>
                                <select 
                                    value={orderFreq}
                                    onChange={(e) => setOrderFreq(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Fortnightly">Fortnightly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Attached Invoice</label>
                        <label 
                            htmlFor="invoice-upload-pricing"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-4 border-dashed rounded-[2rem] p-10 text-center transition-all group relative cursor-pointer block bg-white ${
                                isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' :
                                invoiceFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-100 hover:border-indigo-400 hover:bg-gray-50/50'
                            }`}
                        >
                            <input 
                                id="invoice-upload-pricing"
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png" 
                                onChange={handleFileUpload}
                                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                            />
                            
                            {invoiceFile ? (
                                <div className="flex flex-col items-center gap-3 relative z-0">
                                    <div className="bg-emerald-100 p-4 rounded-3xl text-emerald-600 shadow-md">
                                        <FileText size={32} />
                                    </div>
                                    <div className="text-center w-full px-4">
                                        <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tighter">{invoiceFileName}</p>
                                        <p className="text-[10px] text-emerald-600 font-black mt-1 uppercase tracking-[0.2em]">Active Analyser Link</p>
                                    </div>
                                    <button 
                                        onClick={removeFile}
                                        className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline z-20"
                                    >
                                        Replace File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 py-4">
                                    <div className="p-4 bg-gray-50 rounded-full text-gray-300 group-hover:text-indigo-500 group-hover:bg-white transition-all shadow-inner-sm">
                                        <FilePlus size={32} />
                                    </div>
                                    <div>
                                        <span className="text-base text-gray-900 font-black uppercase tracking-tight block">Upload Competitor Invoice</span>
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block">PDF or Image scan</span>
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PZ Savings (%)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-gray-400 text-xs font-black">%</span>
                                <input 
                                    type="number" 
                                    value={targetSavings}
                                    onChange={(e) => { setTargetSavings(parseFloat(e.target.value)); setIsGenerated(false); }}
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supplier Goal (%)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-gray-400 text-xs font-black">%</span>
                                <input 
                                    type="number" 
                                    value={supplierTarget}
                                    onChange={(e) => { setSupplierTarget(parseFloat(e.target.value)); setIsGenerated(false); }}
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black text-blue-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isProcessing}
                        className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 transition-all mt-4 ${isProcessing ? 'bg-indigo-400 cursor-not-allowed shadow-none' : 'bg-secondary hover:bg-black hover:scale-[1.02] active:scale-95'}`}
                    >
                        {isProcessing ? <><Loader2 size={24} className="animate-spin"/> Scanning Invoice...</> : <><Calculator size={20}/> Start Analysis</>}
                    </button>
                </div>
            </div>

            {/* SUMMARY CARD */}
            {isGenerated && (
                <div className="bg-[#043003] text-white rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-left-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12 scale-150"><TrendingDown size={200}/></div>
                    <div className="relative z-10">
                        <h3 className="font-black text-emerald-400/60 uppercase text-[10px] tracking-[0.3em] mb-10 border-b border-emerald-900 pb-4">Projection Summary</h3>
                        
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400/80 font-black text-[10px] uppercase tracking-widest">Invoiced Spend</span>
                                <span className="text-2xl font-black text-white/40 line-through decoration-white/20">${totalInvoiceSpend.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Platform Zero Rate</span>
                                <span className="text-4xl font-black text-emerald-400 tracking-tighter">${totalPzSpend.toFixed(2)}</span>
                            </div>
                            
                            <div className="pt-8 mt-4 border-t border-emerald-900">
                                <div className="flex items-center gap-2 text-white/60 mb-3">
                                    <TrendingDown size={20}/>
                                    <span className="font-black text-[10px] uppercase tracking-widest">Total Estimated Savings</span>
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <div className="text-6xl font-black text-white tracking-tighter">
                                        ${totalSavingsValue.toFixed(0)}
                                    </div>
                                    <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-black tracking-wider shadow-lg">
                                        {actualSavingsPercent.toFixed(1)}% OFF
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/30">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-200"></div>
                             <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{customerName || 'New Comparison Lead'}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-white border border-gray-200 text-gray-400 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">{targetSavings}% Baseline Savings</span>
                            {weeklySpend && (
                                <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-200 shadow-inner-sm">
                                    <DollarSign size={14}/> Weekly Volume: ${weeklySpend}
                                </span>
                            )}
                            <span className="text-gray-200 mx-2">|</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Market Matched</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportPDF} className="p-4 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                            <Download size={24}/>
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-indigo-700 shadow-xl transition-all active:scale-95">
                            <Mail size={18}/> Send Proposal
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
                    {isGenerated ? (
                        <table className="w-full text-left border-separate border-spacing-y-3 px-6">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-6 py-4">Line Item Product</th>
                                    <th className="px-6 py-4 text-right">Invoiced Price</th>
                                    <th className="px-6 py-4 text-right text-emerald-600">PZ Rate</th>
                                    {showSupplierTargets && (
                                        <th className="px-6 py-4 text-right text-blue-600 bg-blue-50/50 rounded-t-2xl">Target Rate ({supplierTarget}%)</th>
                                    )}
                                    <th className="px-6 py-4 text-right">Variance</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {comparison.map((item, idx) => (
                                    <tr key={idx} className="group transition-all">
                                        <td className="px-6 py-6 bg-white border-y border-l border-gray-100 rounded-l-3xl group-hover:bg-gray-50/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden p-1.5 shadow-sm">
                                                    <img src={item.product.imageUrl} className="w-full h-full object-cover rounded-xl"/>
                                                </div>
                                                <span className="font-black text-gray-900 text-lg tracking-tight">{item.product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 bg-white border-y border-gray-100 text-right group-hover:bg-gray-50/50">
                                            <span className="text-gray-300 font-bold line-through decoration-gray-200 text-lg">${item.invoicePrice.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-6 bg-white border-y border-gray-100 text-right group-hover:bg-gray-50/50">
                                            <span className="text-emerald-600 font-black text-2xl tracking-tighter">${item.pzPrice.toFixed(2)}</span>
                                        </td>
                                        {showSupplierTargets && (
                                            <td className="px-6 py-6 bg-blue-50/30 border-y border-gray-100 text-right group-hover:bg-blue-50/50">
                                                <span className="text-blue-700 font-black text-xl tracking-tight">${item.supplierTargetPrice.toFixed(2)}</span>
                                            </td>
                                        )}
                                        <td className="px-6 py-6 bg-white border-y border-r border-gray-100 rounded-r-3xl text-right group-hover:bg-gray-50/50">
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                                                -{item.savingsPercent}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-8 py-32">
                            <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border-4 border-dashed border-gray-100 shadow-inner-sm">
                                <Calculator size={48} className="opacity-10"/>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-gray-900 tracking-tight uppercase">Waiting for Data</p>
                                <p className="text-gray-500 mt-2 font-medium max-w-sm">Upload a competitor invoice and configure the savings target to generate a comparison.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Secondary Actions */}
                <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-8">
                    <button 
                        onClick={() => setShowSupplierTargets(!showSupplierTargets)}
                        className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] px-8 py-3.5 rounded-2xl transition-all shadow-sm ${
                            showSupplierTargets 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 ring-4 ring-blue-50' 
                            : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                    >
                        {showSupplierTargets ? <EyeOff size={18}/> : <Eye size={18}/>} 
                        {showSupplierTargets ? 'Hide Wholesaler Strategy' : 'Review Procurement Target'}
                    </button>
                    
                    {isGenerated && showSupplierTargets && (
                        <div className="flex items-center gap-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="text-right">
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Target Procurement Total</p>
                                <p className="text-2xl font-black text-blue-600 tracking-tighter">${comparison.reduce((sum, i) => sum + i.supplierTargetPrice, 0).toFixed(2)}</p>
                            </div>
                            <button 
                                onClick={handleOpenSupplierModal}
                                className="bg-[#0F172A] text-white px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Send size={20}/> Source Wholesaler
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {isSupplierModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Assign Partner</h2>
                      <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full shadow-sm border border-gray-100"><X size={28}/></button>
                  </div>
                  <div className="p-10 space-y-8">
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">Choose a wholesaler or farmer to fulfill this pricing request. They will receive the product varieties and target price goals but no lead identifying data.</p>
                      
                      <div className="space-y-3">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Wholesaler / Farmer</label>
                          <div className="relative" ref={dropdownRef}>
                            <button 
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] text-left font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all flex items-center justify-between shadow-inner-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <Store className="text-gray-300" size={24}/>
                                    <span className={selectedSupplierId ? 'text-gray-900' : 'text-gray-400'}>
                                        {selectedSupplier 
                                            ? `${selectedSupplier.businessName}` 
                                            : "Select network partner..."}
                                    </span>
                                </div>
                                <ChevronDown size={24} className={`text-gray-300 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute left-0 right-0 top-full mt-3 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden py-3 animate-in slide-in-from-top-2 duration-200">
                                    {wholesalers.map(w => (
                                        <button 
                                            key={w.id}
                                            type="button"
                                            onClick={() => { setSelectedSupplierId(w.id); setIsDropdownOpen(false); }}
                                            className={`w-full text-left px-6 py-4 text-sm font-black flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedSupplierId === w.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                                        >
                                            <span>{w.businessName} <span className="opacity-40 font-bold ml-1">({w.role})</span></span>
                                            {selectedSupplierId === w.id && <Check size={20} className="text-indigo-600"/>}
                                        </button>
                                    ))}
                                </div>
                            )}
                          </div>
                      </div>
                      
                      <div className="bg-blue-50 p-6 rounded-[1.5rem] border-2 border-blue-100 text-[10px] font-black text-blue-700 flex gap-4 shadow-sm">
                          <Info size={24} className="shrink-0 text-blue-400"/>
                          <p className="leading-relaxed">Dispatching targets for <span className="text-blue-900 font-black">{comparison.length} line items</span> totaling <span className="text-blue-900 font-black">${comparison.reduce((sum, i) => sum + i.supplierTargetPrice, 0).toFixed(2)}</span>.</p>
                      </div>

                      <div className="flex flex-col gap-4 pt-4">
                          <button 
                              onClick={handleSendSupplierRequest}
                              disabled={!selectedSupplierId}
                              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:scale-100 active:scale-95"
                          >
                              <Rocket size={20}/> Initiate Procurement
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
