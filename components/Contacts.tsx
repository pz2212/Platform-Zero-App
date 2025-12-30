
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, InventoryItem, Product, ChatMessage, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { 
  MessageCircle, Send, Plus, X, Search, Info, 
  ShoppingBag, Link as LinkIcon, CheckCircle, Clock,
  Store, MapPin, Phone, ShieldCheck, Tag, ChevronRight, Users, UserCheck,
  ArrowLeft, UserPlus, Smartphone, Contact, Loader2, Building, Mail, BookOpen,
  Package, DollarSign, Truck, Camera, Image as ImageIcon, ChevronDown, FolderOpen
} from 'lucide-react';

interface ContactsProps {
  user: User;
}

const SendProductOfferModal = ({ isOpen, onClose, targetPartner, user, products }: { 
    isOpen: boolean, 
    onClose: () => void, 
    targetPartner: User, 
    user: User,
    products: Product[]
}) => {
    const [offerData, setOfferData] = useState({
        productId: '',
        price: '',
        unit: 'KG',
        logisticsPrice: '0',
        note: ''
    });
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const [successState, setSuccessState] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowPhotoMenu(false);
            }
        };
        if (showPhotoMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPhotoMenu]);

    if (!isOpen) return null;

    const selectedProduct = products.find(p => p.id === offerData.productId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setCustomImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
            setShowPhotoMenu(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const productName = selectedProduct?.name || 'Fresh Produce';
        const messageText = `Check out our fresh ${productName}! Available now at $${offerData.price}/${offerData.unit.toLowerCase()}. Logistics: $${offerData.logisticsPrice}.`;
        
        // 1. Send Chat Message (Now with image support)
        mockService.sendChatMessage(user.id, targetPartner.id, messageText, true, offerData.productId, customImage || undefined);
        
        // 2. Trigger Portal Notification for the receiver
        mockService.addAppNotification(
            targetPartner.id,
            'New Product Offer',
            `${user.businessName} sent you a direct offer for ${productName}.`,
            'PRICE_REQUEST',
            `/contacts?id=${user.id}`
        );

        setTimeout(() => {
            setIsSubmitting(false);
            setSuccessState(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        }, 1200);
    };

    if (successState) {
        return (
            <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner-sm">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Offer Sent!</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">Your product offer has been delivered directly to {targetPartner.businessName}'s portal.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Send Product Offer</h2>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">To: {targetPartner.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-600 p-2 bg-slate-50 rounded-full border border-slate-100 transition-all"><X size={24}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 relative">
                    <div className="space-y-6">
                        {/* SELECT PRODUCT SECTION */}
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                            <div className="flex gap-4 items-center">
                                {/* PHOTO CAPTURE AREA */}
                                <div className="relative">
                                    <div 
                                        onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                                        className={`w-20 h-20 rounded-2xl bg-slate-50 border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all group overflow-hidden ${customImage ? 'border-emerald-500' : 'border-slate-100 hover:border-emerald-300'}`}
                                    >
                                        {customImage ? (
                                            <img src={customImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-2 flex flex-col items-center gap-1">
                                                <Camera className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={24}/>
                                                <span className="text-[8px] font-black text-slate-300 group-hover:text-emerald-500 transition-colors uppercase">Photo</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* HIDDEN INPUTS */}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

                                    {/* SOURCE SELECTION MENU */}
                                    {showPhotoMenu && (
                                        <div ref={menuRef} className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-[150] animate-in zoom-in-95 duration-200 origin-top-left">
                                            <button 
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full text-left px-5 py-3.5 hover:bg-slate-50 flex items-center gap-4 transition-colors group"
                                            >
                                                <ImageIcon size={20} className="text-slate-400 group-hover:text-emerald-600"/>
                                                <span className="font-bold text-slate-700">Photo Library</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => cameraInputRef.current?.click()}
                                                className="w-full text-left px-5 py-3.5 hover:bg-slate-50 flex items-center gap-4 transition-colors border-y border-slate-50 group"
                                            >
                                                <Camera size={20} className="text-slate-400 group-hover:text-emerald-600"/>
                                                <span className="font-bold text-slate-700">Take Photo</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full text-left px-5 py-3.5 hover:bg-slate-50 flex items-center gap-4 transition-colors group"
                                            >
                                                <FolderOpen size={20} className="text-slate-400 group-hover:text-emerald-600"/>
                                                <span className="font-bold text-slate-700">Choose File</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 relative group">
                                    <select 
                                        required
                                        className="w-full pl-6 pr-10 py-5 bg-white border-2 border-emerald-500 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-900 appearance-none shadow-sm transition-all"
                                        value={offerData.productId}
                                        onChange={e => setOfferData({...offerData, productId: e.target.value})}
                                    >
                                        <option value="">Choose item...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={20}/>
                                </div>
                            </div>
                        </div>

                        {/* PRICE & UNIT SECTION */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Per Unit</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                                    <input 
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full pl-11 pr-4 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-slate-900 transition-all"
                                        value={offerData.price}
                                        onChange={e => setOfferData({...offerData, price: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-black text-slate-900 appearance-none transition-all"
                                        value={offerData.unit}
                                        onChange={e => setOfferData({...offerData, unit: e.target.value})}
                                    >
                                        <option value="KG">KG</option>
                                        <option value="TRAY">Tray</option>
                                        <option value="BIN">Bin</option>
                                        <option value="EACH">Each</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20}/>
                                </div>
                            </div>
                        </div>

                        {/* LOGISTICS SECTION */}
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistic Price (Optional)</label>
                            <div className="relative">
                                <Truck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-black text-slate-900 transition-all"
                                    value={offerData.logisticsPrice}
                                    onChange={e => setOfferData({...offerData, logisticsPrice: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !offerData.productId}
                            className="w-full py-5 bg-[#043003] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(4,48,3,0.3)] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Send size={16} strokeWidth={3}/>}
                            Submit to Portal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManualInviteModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: User }) => {
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [isSyncing, setIsSyncing] = useState(false);
    
    if (!isOpen) return null;

    const handleSyncFromPhonebook = async () => {
        try {
            setIsSyncing(true);
            // Web Contact Picker API - requires HTTPS and mobile browser support
            // @ts-ignore
            if ('contacts' in navigator && 'select' in navigator.contacts) {
                const props = ['name', 'tel'];
                const opts = { multiple: false };
                // @ts-ignore
                const selectedContacts = await navigator.contacts.select(props, opts);
                
                if (selectedContacts && selectedContacts.length > 0) {
                    const person = selectedContacts[0];
                    const name = person.name?.[0] || '';
                    const phone = person.tel?.[0]?.replace(/[^\d+]/g, '') || '';
                    setFormData({ name, phone });
                }
            } else {
                // High-fidelity fallback simulation for desktop/non-supported browsers
                await new Promise(resolve => setTimeout(resolve, 800));
                // Just to demonstrate the UI flow when native API isn't present
                alert("The Web Contact Picker is only available on supported mobile browsers (Chrome Android/Safari iOS).");
            }
        } catch (err) {
            console.error("Phonebook access error", err);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const inviteLink = generateProductDeepLink('portal', user.id);
        const message = `Hi ${formData.name || 'there'}, ${user.businessName} is using Platform Zero to trade fresh produce. Connect with us here: ${inviteLink}`;
        
        // This triggers the native SMS app
        triggerNativeSms(formData.phone, message);
        
        // In the mock world, we'll assume the connection is made so they appear in the directory
        mockService.onboardNewBusiness({
          type: 'Supplier',
          businessName: formData.name || 'New Partner',
          email: `${formData.name.toLowerCase().replace(/\s/g, '')}@example.com`,
          phone: formData.phone,
          abn: 'N/A',
          address: 'VIC, Australia',
          customerType: 'Partner',
          role: UserRole.FARMER // Mock role
        });
        
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Invite Partner</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                
                {/* PRIMARY ACTION: SYNC FROM PHONE BOOK */}
                <div className="px-8 pt-8">
                    <button 
                        onClick={handleSyncFromPhonebook}
                        disabled={isSyncing}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 disabled:opacity-50"
                    >
                        {isSyncing ? <Loader2 size={18} className="animate-spin"/> : <BookOpen size={18} strokeWidth={2.5}/>}
                        <span>Select from Phone Book</span>
                    </button>
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-gray-100"></div>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">OR MANUAL ENTRY</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>
                </div>

                <form onSubmit={handleSend} className="p-8 pt-0 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-black text-[#94a3b8] uppercase tracking-widest mb-3 ml-1">Partner Name</label>
                            <div className="relative group">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                <input 
                                    required 
                                    placeholder="Full Name" 
                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-900 transition-all" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-[#94a3b8] uppercase tracking-widest mb-3 ml-1">Mobile Number</label>
                            <div className="relative group">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                                <input 
                                    required 
                                    type="tel" 
                                    placeholder="0400 000 000" 
                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-emerald-500 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-900 transition-all shadow-sm" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-5 bg-[#043003] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <Send size={18} strokeWidth={2.5}/> Send Invite SMS
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        This will open your native messaging app
                    </p>
                </form>
            </div>
        </div>
    );
};

export const Contacts: React.FC<ContactsProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const targetId = queryParams.get('id');

  const [activeContact, setActiveContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isManualInviteOpen, setIsManualInviteOpen] = useState(false);
  const [sendProductTarget, setSendProductTarget] = useState<User | null>(null);
  const [myInventory, setMyInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [directory, setDirectory] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show all wholesalers/farmers except current user
    const all = mockService.getAllUsers().filter(u => u.id !== user.id && (u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
    setDirectory(all);

    if (targetId) {
      const found = all.find(u => u.id === targetId);
      if (found) {
        setActiveContact(found);
        const chatHistory = mockService.getChatMessages(user.id, targetId);
        setMessages(chatHistory);
        
        if (chatHistory.length === 0) {
            mockService.sendChatMessage(targetId, user.id, `Hi ${user.name.split(' ')[0]}, thanks for reaching out. We are looking for fresh stock this morning.`);
            setMessages(mockService.getChatMessages(user.id, targetId));
        }
      }
    } else {
      setActiveContact(null);
    }
    
    setMyInventory(mockService.getInventory(user.id));
    setProducts(mockService.getAllProducts());
  }, [targetId, user.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeContact]);

  const handleAddFromDevice = async () => {
    setIsManualInviteOpen(true);
  };

  const handleSendMessage = (text: string, isProductLink = false, productId?: string) => {
    if (!activeContact || (!text.trim() && !isProductLink)) return;

    // Send the message via service
    mockService.sendChatMessage(user.id, activeContact.id, text, isProductLink, productId);
    
    // TRADITIONAL APP BEHAVIOR: Trigger a notification in the receiver's portal
    mockService.addAppNotification(
        activeContact.id, 
        'New Message Received', 
        `${user.businessName} sent you a message: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`, 
        'SYSTEM', 
        `/contacts?id=${user.id}`
    );

    setMessages(mockService.getChatMessages(user.id, activeContact.id));
    if (!isProductLink) setInputText('');
    
    // Simulate active reply for specific demo wholesaler
    if (activeContact.id === 'u2') {
        setTimeout(() => {
            mockService.sendChatMessage(activeContact.id, user.id, "Thanks, looking into this now. Will confirm details shortly.");
            setMessages(mockService.getChatMessages(user.id, activeContact.id));
        }, 2000);
    }
  };

  const handleShareProduct = (item: InventoryItem) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    const link = generateProductDeepLink('product', item.id, user.id);
    const text = `Check out my fresh ${product.name}! 🌟 Available now at $${product.defaultPricePerKg.toFixed(2)}/kg. View details: ${link}`;
    
    handleSendMessage(text, true, product.id);
    setIsShareModalOpen(false);
  };

  const filteredDirectory = directory.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeContact) {
      return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Network Directory</h1>
                    <p className="text-gray-500 font-medium">Connect with verified farms and wholesalers in the Platform Zero network.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search partners..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    
                    <button 
                        onClick={handleAddFromDevice}
                        className="bg-[#000000] text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#111111] transition-all shadow-xl active:scale-95 min-w-[200px]"
                    >
                        <UserPlus size={18} strokeWidth={2.5}/>
                        <span>Add Contact</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDirectory.map(contact => (
                    <div 
                        key={contact.id} 
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group flex flex-col justify-between"
                    >
                        <div onClick={() => navigate(`/contacts?id=${contact.id}`)} className="cursor-pointer">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center font-black text-2xl shadow-inner-sm ${
                                    contact.role === UserRole.FARMER ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {contact.businessName.charAt(0)}
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                                    <UserCheck size={14}/>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-emerald-900 mb-1">{contact.businessName}</h3>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.15em] opacity-60 mb-6">{contact.role}</p>
                                
                                <div className="space-y-2 mb-8">
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase">
                                        <MapPin size={16} className="text-gray-300"/> Melbourne Regional
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase">
                                        <Tag size={16} className="text-gray-300"/> 12+ Seasonal Products
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setSendProductTarget(contact)}
                                className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white hover:shadow-lg"
                            >
                                <Package size={16}/> Send Product
                            </button>
                            <button 
                                onClick={() => navigate(`/contacts?id=${contact.id}`)}
                                className="flex-[2] py-4 bg-gray-50 text-gray-400 group-hover:bg-[#043003] group-hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-100"
                            >
                                <MessageCircle size={18}/> Start Conversation
                            </button>
                        </div>
                    </div>
                ))}
                
                <div 
                    onClick={() => setIsManualInviteOpen(true)}
                    className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer min-h-[360px]"
                >
                    <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Plus size={32} className="text-gray-300 group-hover:text-emerald-500"/>
                    </div>
                    <h3 className="text-xl font-black text-gray-400 group-hover:text-emerald-900 tracking-tight uppercase mb-2">Invite Others</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-[200px]">Send an SMS invitation to any wholesaler or farmer.</p>
                </div>
            </div>

            <ManualInviteModal 
                isOpen={isManualInviteOpen} 
                onClose={() => setIsManualInviteOpen(false)} 
                user={user} 
            />

            {sendProductTarget && (
                <SendProductOfferModal 
                    isOpen={!!sendProductTarget} 
                    onClose={() => setSendProductTarget(null)} 
                    targetPartner={sendProductTarget} 
                    user={user}
                    products={products}
                />
            )}
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
            activeContact.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {activeContact.businessName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h2 className="font-black text-gray-900 text-xl tracking-tight leading-none">{activeContact.businessName}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{activeContact.role} • Active Now</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => navigate('/contacts')}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-all shadow-sm flex items-center gap-2 px-4"
            >
                <ArrowLeft size={18}/>
                <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Back to directory</span>
            </button>
            <button 
                onClick={() => setSendProductTarget(activeContact)}
                className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2 px-4"
            >
                <Package size={18}/>
                <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Send Product</span>
            </button>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"><Phone size={18}/></button>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"><Info size={18}/></button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar"
      >
        {messages.map(msg => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-3xl shadow-sm text-sm ${
                  isMe 
                    ? 'bg-slate-900 text-white rounded-br-none' 
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}>
                  {msg.isProductLink ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            <Tag size={12}/> Product Offer Attached
                        </div>
                        {msg.imageUrl && (
                            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-3">
                                <img src={msg.imageUrl} className="w-full h-48 object-cover" />
                            </div>
                        )}
                        <p className="leading-relaxed font-medium break-words">{msg.text}</p>
                    </div>
                  ) : (
                    <p className="leading-relaxed font-medium break-words">{msg.text}</p>
                  )}
                  <p className={`text-[10px] mt-2 opacity-50 font-bold uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex gap-4 items-center">
            <button 
                onClick={() => setIsShareModalOpen(true)}
                className="p-3.5 bg-gray-100 text-gray-500 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 flex items-center justify-center shadow-inner-sm group"
                title="Send Product Link"
            >
                <LinkIcon size={20} className="group-hover:rotate-45 transition-transform" />
            </button>
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 pr-12 font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)}
                />
                <button 
                    onClick={() => handleSendMessage(inputText)}
                    disabled={!inputText.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#043003] text-white rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-30 disabled:scale-100 active:scale-90"
                >
                    <Send size={18}/>
                </button>
            </div>
        </div>
      </div>

      {isShareModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Share My Stock</h2>
                        <p className="text-sm text-gray-500 font-medium">Select a product to share as a direct link.</p>
                      </div>
                      <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all"><X size={24}/></button>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-3 custom-scrollbar">
                      {myInventory.length === 0 ? (
                          <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                              <ShoppingBag size={48} className="opacity-20 mb-4"/>
                              <p className="font-black uppercase tracking-widest text-xs">You have no active items in inventory.</p>
                          </div>
                      ) : myInventory.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                              <div 
                                key={item.id} 
                                onClick={() => handleShareProduct(item)}
                                className="group flex items-center justify-between p-4 rounded-2xl border-2 border-gray-50 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-sm"
                              >
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                                          <img src={product?.imageUrl} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                          <p className="font-black text-gray-900 text-sm leading-tight">{product?.name}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.quantityKg}kg Available</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-black text-emerald-600">${product?.defaultPricePerKg.toFixed(2)}/kg</p>
                                      <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Share Link <ChevronRight size={12}/>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>

                  <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                      <button onClick={() => setIsShareModalOpen(false)} className="w-full py-4 bg-white border-2 border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                  </div>
              </div>
          </div>
      )}

      {sendProductTarget && (
          <SendProductOfferModal 
              isOpen={!!sendProductTarget} 
              onClose={() => setSendProductTarget(null)} 
              targetPartner={sendProductTarget} 
              user={user}
              products={products}
          />
      )}
    </div>
  );
};
