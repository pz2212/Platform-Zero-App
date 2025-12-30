
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ScanLine, CheckCircle, Send, MessageSquare, AlertCircle, Loader2, Image as ImageIcon, FolderOpen, X, Store, MapPin, Share2, Heart } from 'lucide-react';
import { mockService } from '../services/mockDataService';
import { identifyProductFromImage } from '../services/geminiService';
import { Customer, User, InventoryItem, Product } from '../types';
import { ChatDialog } from './ChatDialog';
import { ShareModal } from './SellerDashboardV1';

interface AiOpportunityMatcherProps {
  user?: User;
}

export const AiOpportunityMatcher: React.FC<AiOpportunityMatcherProps> = ({ user }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{name: string, quality: string} | null>(null);
  const [matchedBuyers, setMatchedBuyers] = useState<Customer[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [isSending, setIsSending] = useState(false);
  const [offersSent, setOffersSent] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Share State
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Menu State for Photo Source
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [activeBuyerName, setActiveBuyerName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(mockService.getAllProducts());
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSourceMenu(false);
      }
    };
    if (showSourceMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSourceMenu]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        analyseImage(base64String.split(',')[1]); 
      };
      reader.readAsDataURL(file);
    }
    setShowSourceMenu(false);
  };

  const analyseImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setMatchedBuyers([]);
    setOffersSent(false);
    setIsSaved(false);

    try {
        const result = await identifyProductFromImage(base64Data);
        setAnalysisResult({ name: result.name, quality: result.quality });
        const buyers = mockService.findBuyersForProduct(result.name);
        setMatchedBuyers(buyers);
    } catch (error) {
        console.error("Analysis failed", error);
        alert("Could not analyse image. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleAddToInventory = () => {
    if (!analysisResult) return;
    
    // Find matching product in catalog
    const product = products.find(p => p.name.toLowerCase().includes(analysisResult.name.toLowerCase())) || products[0];
    
    const newItem: InventoryItem = {
        id: `inv-ai-${Date.now()}`,
        ownerId: user?.id || 'u2',
        productId: product.id,
        quantityKg: 100, // Default for quick entry
        status: 'Available',
        harvestDate: new Date().toISOString(),
        harvestLocation: 'Direct via AI Scanner',
        expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        batchImageUrl: image || undefined
    };

    mockService.addInventoryItem(newItem);
    setIsSaved(true);
    alert(`${analysisResult.name} successfully added to your active inventory catalog!`);
  };

  const handleSendOffers = () => {
    setIsSending(true);
    setTimeout(() => {
        setIsSending(false);
        setOffersSent(true);
        setTimeout(() => setOffersSent(false), 5000);
    }, 1500);
  };

  const openChat = (buyer: Customer) => {
      setActiveBuyerName(buyer.businessName);
      setChatOpen(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImage(base64String);
          analyseImage(base64String.split(',')[1]);
        };
        reader.readAsDataURL(file);
    }
  };

  // Mock a temporary item for the share modal to work with
  const syntheticItem: InventoryItem | null = analysisResult ? {
      id: `tmp-share-${Date.now()}`,
      ownerId: user?.id || 'u2',
      productId: products.find(p => p.name.toLowerCase().includes(analysisResult.name.toLowerCase()))?.id || 'p1',
      quantityKg: 100,
      expiryDate: new Date().toISOString(),
      harvestDate: new Date().toISOString(),
      status: 'Available'
  } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <ScanLine className="text-indigo-600" size={32}/> AI Opportunity Matcher
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Snap or upload produce to instantly notify active buyers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: UPLOAD & PREVIEW */}
        <div className="space-y-6">
            <div 
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => !image && setShowSourceMenu(true)}
                className={`border-2 border-dashed rounded-[2rem] h-96 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden bg-white shadow-inner-sm ${image ? 'border-indigo-100 shadow-none' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50/50'}`}
            >
                {/* Hidden Inputs */}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                
                {image ? (
                    <>
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); setImage(null); setAnalysisResult(null); setMatchedBuyers([]); setIsSaved(false); }}
                            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg text-gray-500 hover:text-red-500 transition-all active:scale-90"
                        >
                            <X size={20}/>
                        </button>
                    </>
                ) : (
                    <div className="text-center p-8 animate-in fade-in zoom-in duration-300">
                        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-sm">
                            <Camera size={40} strokeWidth={2.5}/>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Upload Product Photo</h3>
                        <p className="text-gray-500 font-medium">Click or drag and drop to identify</p>
                    </div>
                )}
                
                {/* Photo Source Menu */}
                {showSourceMenu && (
                    <div ref={menuRef} className="absolute z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 py-2 w-64 animate-in zoom-in-95 fade-in duration-200">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-4 transition-colors">
                            <ImageIcon size={20} className="text-gray-600"/>
                            <span className="font-bold text-gray-800">Photo Library</span>
                        </button>
                        <button onClick={() => cameraInputRef.current?.click()} className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-4 transition-colors border-y border-gray-50">
                            <Camera size={20} className="text-gray-600"/>
                            <span className="font-bold text-gray-800">Take Photo</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-5 py-3.5 hover:bg-gray-50 flex items-center gap-4 transition-colors">
                            <FolderOpen size={20} className="text-gray-600"/>
                            <span className="font-bold text-gray-800">Choose File</span>
                        </button>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col z-10 animate-in fade-in duration-300">
                         <div className="relative">
                            <Loader2 size={64} className="text-indigo-600 animate-spin mb-4 opacity-20"/>
                            <ScanLine size={48} className="text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"/>
                         </div>
                         <p className="text-indigo-900 font-black uppercase tracking-widest text-xs mt-4">AI Scan in progress...</p>
                    </div>
                )}
            </div>

            {analysisResult && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-100 animate-in slide-in-from-left-4 duration-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 shadow-inner-sm">
                                <CheckCircle size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-2xl tracking-tight">{analysisResult.name}</h3>
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Identified by Platform Zero AI</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={handleAddToInventory}
                                className={`p-3 rounded-full transition-all active:scale-95 shadow-md ${isSaved ? 'bg-red-500 text-white shadow-red-100' : 'bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
                                title="Add to My Inventory"
                             >
                                <Heart size={24} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2}/>
                             </button>
                             <button 
                                onClick={() => setIsShareOpen(true)}
                                className="p-3 bg-white border border-gray-200 rounded-full text-indigo-600 shadow-md hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95"
                                title="Share with Contacts"
                             >
                                <Share2 size={24} />
                             </button>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 mb-8">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Quality Assessment</span>
                        <p className="text-emerald-900 font-bold text-lg">"{analysisResult.quality}"</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Set Your Direct Sale Price ($/kg)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-2xl">$</span>
                            <input 
                                type="number" 
                                className="w-full pl-10 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-3xl text-gray-900 transition-all"
                                placeholder="0.00"
                                value={price || ''}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: MATCHED BUYERS */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 flex flex-col h-[700px] overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Buyer Opportunities</h2>
                    <p className="text-sm text-gray-500 font-medium">
                        {matchedBuyers.length > 0 
                            ? `${matchedBuyers.length} buyers matched for this product` 
                            : "Upload a photo to see matching demand"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {matchedBuyers.length > 0 && (
                        <button 
                            onClick={() => setIsShareOpen(true)}
                            className="p-2.5 bg-white border-2 border-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
                            title="Share with contacts"
                        >
                            <Share2 size={20} strokeWidth={2.5}/>
                        </button>
                    )}
                    {matchedBuyers.length > 0 && <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">{matchedBuyers.length}</div>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {matchedBuyers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <ScanLine size={40} className="opacity-20"/>
                        </div>
                        <p className="font-bold text-lg text-gray-300">No matches yet.</p>
                        <p className="text-sm max-w-[200px] mt-2">Active buyers looking for items will appear here after AI identification.</p>
                    </div>
                ) : (
                    matchedBuyers.map(buyer => (
                        <div key={buyer.id} className="group border-2 border-gray-50 rounded-2xl p-5 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-gray-900 text-lg tracking-tight group-hover:text-indigo-900">{buyer.businessName}</h3>
                                {buyer.connectionStatus === 'Active' ? (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">Connected</span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">Network lead</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 font-bold uppercase tracking-tight">
                                <span className="flex items-center gap-1"><Store size={14}/> {buyer.category}</span>
                                <span className="flex items-center gap-1"><MapPin size={14}/> {buyer.onboardingData?.deliveryAddress || 'Melbourne'}</span>
                            </div>
                            
                            <div className="flex gap-2">
                                {buyer.connectionStatus === 'Active' ? (
                                    <button 
                                        onClick={() => openChat(buyer)}
                                        className="flex-1 py-3 bg-white border-2 border-indigo-100 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MessageSquare size={16}/> Chat & Propose
                                    </button>
                                ) : (
                                    <button className="flex-1 py-3 bg-gray-100 text-gray-400 font-black text-xs uppercase tracking-[0.2em] rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                        <AlertCircle size={16}/> Intro Needed
                                    </button>
                                )}
                                <button 
                                    onClick={() => setIsShareOpen(true)}
                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                                >
                                    <Share2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {matchedBuyers.length > 0 && (
                <div className="p-8 border-t border-gray-100 bg-gray-50">
                    {offersSent ? (
                        <div className="bg-[#043003] text-white p-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm animate-in zoom-in duration-300 shadow-xl">
                            <CheckCircle size={24} className="text-emerald-400"/> Proposal Sent!
                        </div>
                    ) : (
                        <button 
                            onClick={handleSendOffers}
                            disabled={!price || isSending}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 transition-all"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 size={24} className="animate-spin"/> Dispatching...
                                </>
                            ) : (
                                <>
                                    <Send size={20} /> Bulk Propose to {matchedBuyers.length} Buyers
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>

      <ChatDialog 
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        orderId="PROPOSAL-LIVE"
        issueType={`${analysisResult?.name} @ $${price}/kg`}
        repName={activeBuyerName}
        imageUrl={image || undefined}
      />

      {isShareOpen && syntheticItem && (
          <ShareModal 
            item={syntheticItem}
            onClose={() => setIsShareOpen(false)}
            onComplete={() => setIsShareOpen(false)}
            currentUser={user || {id: 'u2', name: ' Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: 'WHOLESALER' as any, email: 'sarah@fresh.com'}}
          />
      )}
    </div>
  );
};
