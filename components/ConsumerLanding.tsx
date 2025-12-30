
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, ArrowRight, CheckCircle, Calendar, DollarSign, 
  TrendingUp, FileText, Loader2, MapPin, Mail, Phone, 
  Building, User, Clock, Star, X, Table, ArrowDown, Rocket, ClipboardList, ShieldCheck, CreditCard, Truck, Users, BookOpen, 
  ShoppingCart,
  Store,
  Sprout,
  ChevronDown,
  Check
} from 'lucide-react';
import { mockService } from '../services/mockDataService';
import { extractInvoiceItems, InvoiceItem } from '../services/geminiService';
import { UserRole, BusinessCategory } from '../types';

interface ConsumerLandingProps {
  onLogin?: () => void;
}

const TERMS_CONTENT = `
Platform Zero Terms and Conditions
... (Terms content truncated for brevity)
`;

const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Deli', 'Cafe', 'Restaurant', 'Pub', 'Sporting club', 'Catering', 'Grocery store'
];

export const ConsumerLanding: React.FC<ConsumerLandingProps> = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.CONSUMER);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Global Config for Savings - fetched from mockService
  const [segmentConfigs] = useState(mockService.getMarketSegmentConfigs());

  // Workflow State
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // T&C State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    location: '',
    email: '',
    name: '',
    mobile: '',
    weeklySpend: '',
    orderFreq: '1-2 (Weekly)',
    businessCategory: 'Restaurant' as BusinessCategory
  });

  // Extended Onboarding State
  const [extendedData, setExtendedData] = useState({
      abn: '',
      deliveryAddress: '',
      deliveryInstructions: '',
      productsList: '',
      deliveryDays: [] as string[],
      deliveryTimeSlot: '',
      chefName: '',
      chefEmail: '',
      chefMobile: '',
      accountsEmail: '',
      accountsMobile: '',
      accept7DayTerms: false,
      want55DayTerms: false 
  });

  const [errors, setErrors] = useState({
    weeklySpend: '',
    file: '',
    general: ''
  });

  const [savings, setSavings] = useState({
    weekly: 0,
    monthly: 0,
    annually: 0
  });
  
  const [analyzedItems, setAnalyzedItems] = useState<InvoiceItem[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'weeklySpend') {
        setErrors(prev => ({...prev, weeklySpend: ''}));
    }
  };

  const handleExtendedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setExtendedData({ ...extendedData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setExtendedData({ ...extendedData, [e.target.name]: e.target.checked });
  };

  const handleDayToggle = (day: string) => {
      setExtendedData(prev => {
          const days = prev.deliveryDays.includes(day)
              ? prev.deliveryDays.filter(d => d !== day)
              : [...prev.deliveryDays, day];
          return { ...prev, deliveryDays: days };
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors(prev => ({...prev, file: ''}));
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
          setFile(e.dataTransfer.files[0]);
          setErrors(prev => ({...prev, file: ''}));
      }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setErrors(prev => ({...prev, file: ''}));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleMainSubmit = async () => {
    if (activeRole === UserRole.CONSUMER) {
        await calculateAndProceed();
    } else {
        setShowOnboardingForm(true);
        setStep(4);
    }
  };

  const calculateAndProceed = async () => {
    let hasError = false;
    const newErrors = { weeklySpend: '', file: '', general: '' };

    if (!formData.weeklySpend) {
        newErrors.weeklySpend = 'Required for analysis.';
        hasError = true;
    }
    if (!file) {
        newErrors.file = 'Upload invoice to compare.';
        hasError = true;
    }

    if (hasError) {
        setErrors(newErrors);
        return;
    }

    setStep(2);

    try {
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                const fullBase64 = reader.result as string;
                const mimeType = file.type;

                mockService.submitConsumerSignup({
                    name: formData.name,
                    businessName: formData.businessName,
                    email: formData.email,
                    mobile: formData.mobile,
                    location: formData.location,
                    weeklySpend: parseFloat(formData.weeklySpend),
                    orderFrequency: formData.orderFreq,
                    businessCategory: formData.businessCategory,
                    invoiceFile: fullBase64,
                    requestedRole: activeRole
                });

                const realItems = await extractInvoiceItems(base64Data, mimeType);

                if (realItems && realItems.length > 0) {
                    setAnalyzedItems(realItems);
                    
                    const currentConfig = segmentConfigs[formData.businessCategory] || segmentConfigs['Restaurant'];
                    const realSavingRate = currentConfig.targetSavings / 100;
                    
                    const spend = parseFloat(formData.weeklySpend);
                    const weeklySave = spend * realSavingRate;

                    setSavings({
                        weekly: weeklySave,
                        monthly: weeklySave * 4.33,
                        annually: weeklySave * 52
                    });
                    setStep(3);
                } else {
                    runSimulation();
                }
            };
            reader.readAsDataURL(file);
        }
    } catch (e) {
        runSimulation();
    }
  };

  const runSimulation = () => {
    setTimeout(() => {
      const currentConfig = segmentConfigs[formData.businessCategory] || segmentConfigs['Restaurant'];
      const savingRate = currentConfig.targetSavings / 100;
      
      const spend = parseFloat(formData.weeklySpend);
      const weeklySave = spend * savingRate;
      setSavings({ weekly: weeklySave, monthly: weeklySave * 4.33, annually: weeklySave * 52 });
      
      const items = [
          { name: 'Truss Tomatoes', qty: 10, marketRate: 9.90, pzRate: 9.90 * (1 - savingRate) }, 
          { name: 'Avocados', qty: 5, marketRate: 45.00, pzRate: 45.00 * (1 - savingRate) }
      ];
      setAnalyzedItems(items);
      setStep(3);
    }, 2500);
  };

  const handleAcceptTerms = () => {
      setTermsAccepted(true);
      setShowTermsModal(false);
  };

  const handleBackToHome = () => {
    setStep(1);
    setFile(null);
    setFormData({
      businessName: '',
      location: '',
      email: '',
      name: '',
      mobile: '',
      weeklySpend: '',
      orderFreq: '1-2 (Weekly)',
      businessCategory: 'Restaurant'
    });
    setOnboardingComplete(false);
    setShowOnboardingForm(false);
  };

  const submitFinalOnboarding = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!extendedData.accept7DayTerms || !termsAccepted) {
          alert("Please accept terms to proceed.");
          return;
      }
      mockService.submitConsumerSignup({
        name: formData.name,
        businessName: formData.businessName,
        email: formData.email,
        mobile: formData.mobile,
        location: extendedData.deliveryAddress || formData.location,
        requestedRole: activeRole,
        businessCategory: formData.businessCategory,
        ...extendedData
      });
      setShowOnboardingForm(false);
      setOnboardingComplete(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
           <span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>
        <button onClick={onLogin} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-all">Log in</button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-20 flex-1 flex flex-col justify-center">
        
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* LEFT SIDE: TEXT CONTENT */}
            <div className="space-y-10">
                <div className="space-y-6">
                    <h1 className="text-5xl lg:text-7xl font-black text-[#0F172A] leading-[1.1] tracking-tight">
                      Stop overpaying for <span className="text-[#10B981]">fresh produce.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                        Join the marketplace connecting restaurants directly to farms and wholesalers. Upload your invoice, and we'll show you exactly how much you'll save.
                    </p>
                </div>

                <div className="space-y-5">
                    {[
                        "Direct-to-source pricing",
                        "Consolidated billing & logistics",
                        "Reduce food waste & carbon footprint"
                    ].map((text, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-full bg-[#E6F9F3] text-[#10B981] flex items-center justify-center border border-[#B3EEDC] group-hover:scale-110 transition-transform">
                                <Check size={18} strokeWidth={3} />
                            </div>
                            <span className="text-lg font-bold text-slate-700">{text}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-[#E6F9F3] border border-[#B3EEDC] p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Star size={100} className="fill-[#10B981] text-transparent" />
                    </div>
                    <div className="relative z-10 flex items-start gap-4">
                        <Star className="text-[#10B981] fill-[#10B981] mt-1 shrink-0" size={24} />
                        <div>
                            <h4 className="font-black text-[#043003] uppercase text-sm tracking-widest mb-1">Limited Offer</h4>
                            <p className="text-[#0E6C4E] font-medium leading-relaxed">
                                Start trading today and receive $1000 in your portal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: FORM CARD */}
            <div className="flex justify-center lg:justify-end">
                <div className="bg-white rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 w-full max-w-[540px] overflow-hidden flex flex-col transition-all">
                    {/* ROLE SELECTOR */}
                    <div className="p-6 bg-slate-50/50 flex justify-center border-b border-slate-100">
                        <div className="flex bg-[#F1F5F9] p-1.5 rounded-3xl w-full">
                            <button 
                                onClick={() => setActiveRole(UserRole.CONSUMER)}
                                className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-2xl transition-all duration-300 ${activeRole === UserRole.CONSUMER ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ShoppingCart size={20} className={activeRole === UserRole.CONSUMER ? 'text-indigo-600' : 'text-slate-300'} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Buyer</span>
                            </button>
                            <button 
                                onClick={() => setActiveRole(UserRole.WHOLESALER)}
                                className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-2xl transition-all duration-300 ${activeRole === UserRole.WHOLESALER ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Store size={20} className={activeRole === UserRole.WHOLESALER ? 'text-indigo-600' : 'text-slate-300'} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Supplier</span>
                            </button>
                            <button 
                                onClick={() => setActiveRole(UserRole.FARMER)}
                                className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-2xl transition-all duration-300 ${activeRole === UserRole.FARMER ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Sprout size={20} className={activeRole === UserRole.FARMER ? 'text-indigo-600' : 'text-slate-300'} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Farmer</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase">
                                {activeRole === UserRole.CONSUMER ? 'Get Your Savings Analysis' : 'Sign-Up Details'}
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                    <div className="relative group">
                                        <User size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors"/>
                                        <input 
                                            name="name" placeholder="John Doe"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-sm placeholder-slate-300"
                                            value={formData.name} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile</label>
                                    <div className="relative group">
                                        <Phone size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors"/>
                                        <input 
                                            name="mobile" placeholder="0400 000 000"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-sm placeholder-slate-300"
                                            value={formData.mobile} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                                <div className="relative group">
                                    <Building size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors"/>
                                    <input 
                                        name="businessName" placeholder="The Morning Cafe"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-sm placeholder-slate-300"
                                        value={formData.businessName} onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors"/>
                                        <input 
                                            name="email" placeholder="john@cafe.com" type="email"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-sm placeholder-slate-300"
                                            value={formData.email} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                    <div className="relative group">
                                        <MapPin size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors"/>
                                        <input 
                                            name="location" placeholder="Melbourne, VIC"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-sm placeholder-slate-300"
                                            value={formData.location} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {activeRole === UserRole.CONSUMER && (
                                <div className="space-y-5 pt-1 animate-in fade-in duration-300">
                                    {/* Business Category Selection */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Category</label>
                                        <div className="relative group">
                                            <Store size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none"/>
                                            <select 
                                                name="businessCategory" 
                                                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all appearance-none text-sm"
                                                value={formData.businessCategory} onChange={handleInputChange}
                                            >
                                                {BUSINESS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-3.5 text-slate-300" size={16}/>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Weekly Spend ($)</label>
                                            <div className="relative group">
                                                <DollarSign size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors"/>
                                                <input 
                                                    name="weeklySpend" placeholder="2500" type="number"
                                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all text-sm ${errors.weeklySpend ? 'border-red-300' : 'border-slate-200'}`}
                                                    value={formData.weeklySpend} onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Orders / Month</label>
                                            <div className="relative group">
                                                <Clock size={16} className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none"/>
                                                <select 
                                                    name="orderFreq" 
                                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 transition-all appearance-none text-sm"
                                                    value={formData.orderFreq} onChange={handleInputChange}
                                                >
                                                    <option>1-2 (Weekly)</option>
                                                    <option>3-5 (Weekly)</option>
                                                    <option>Daily</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-3.5 text-slate-300" size={16}/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Recent Invoice</label>
                                        <label 
                                            htmlFor="invoice-upload-landing"
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all group relative cursor-pointer block bg-white ${isDragging ? 'border-indigo-500 bg-indigo-50' : errors.file ? 'border-red-200 bg-red-50' : file ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-100 hover:border-indigo-400 hover:bg-slate-50'}`}
                                        >
                                            <input id="invoice-upload-landing" type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                                            {file ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-emerald-100 p-2.5 rounded-2xl mb-2 text-emerald-600"><CheckCircle size={24}/></div>
                                                    <p className="font-black text-slate-900 uppercase tracking-tighter truncate w-full px-4 text-xs">{file.name}</p>
                                                    <button onClick={removeFile} className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Replace File</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-slate-50 p-3 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-inner-sm text-slate-300 group-hover:text-indigo-500 group-hover:bg-white"><Upload size={20}/></div>
                                                    <span className="text-slate-900 font-black text-xs uppercase tracking-tight">Click to upload or drag and drop</span>
                                                    <span className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-widest">PDF or Image to compare prices</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleMainSubmit}
                            className="w-full py-4 bg-[#0B1221] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {activeRole === UserRole.CONSUMER ? 'Analyse & See Savings' : 'Next'}
                            <ArrowRight size={18}/>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* LOADING SCREEN (Step 2) */}
        {step === 2 && (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500 text-center">
                <div className="relative">
                    <div className="w-24 h-24 border-8 border-slate-100 rounded-full"></div>
                    <div className="w-24 h-24 border-8 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    <Loader2 size={40} className="text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mt-10 mb-4 tracking-tight uppercase">Analysing Market Impact</h2>
                <p className="text-slate-500 max-w-md font-medium">Matching Varieties • Verifying CO2e savings • Calculating arbitrage</p>
            </div>
        )}

        {/* RESULTS SCREEN (Step 3) */}
        {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block border border-emerald-200">Analysis Summary</span>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">Your Direct-to-Source Savings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekly Advantage</p>
                        <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">${savings.weekly.toFixed(0)}</h3>
                    </div>
                    <div className="bg-[#0B1221] p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden transform md:-translate-y-2">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Annual Projected ROI</p>
                        <h3 className="text-5xl font-black text-white tracking-tighter">${savings.annually.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Delta</p>
                        <h3 className="text-4xl font-black text-indigo-600 tracking-tighter">${savings.monthly.toFixed(0)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden mb-12">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                            <FileText size={20} className="text-slate-400"/> Price Delta Map
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5">Product Line</th>
                                    <th className="px-8 py-5 text-right">Invoiced Rate</th>
                                    <th className="px-8 py-5 text-right text-emerald-700">PZ Wholesale</th>
                                    <th className="px-8 py-5 text-right">Efficiency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {analyzedItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6 font-black text-slate-900 text-lg tracking-tight">{item.name}</td>
                                        <td className="px-8 py-6 text-right text-slate-300 line-through font-bold">${item.marketRate.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right font-black text-emerald-600 text-2xl tracking-tighter">${item.pzRate.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right font-black text-slate-900">
                                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-100 shadow-sm">-{((1 - item.pzRate / item.marketRate) * 100).toFixed(0)}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={() => setStep(4)}
                        className="px-16 py-6 bg-[#0B1221] text-white rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center gap-4 group"
                    >
                        Unlock Exclusive Rates <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform"/>
                    </button>
                </div>
            </div>
        )}

        {/* ONBOARDING FLOW (Step 4) */}
        {step === 4 && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 w-full">
                {!onboardingComplete ? (
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Portal Provisioning</h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Setting up: {formData.businessName}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 p-2 bg-slate-50 rounded-full transition-all"><X size={24}/></button>
                        </div>
                        <form onSubmit={submitFinalOnboarding} className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Building size={18}/> Business Setup
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company ABN</label>
                                        <input required name="abn" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold" value={extendedData.abn} onChange={handleExtendedChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Address</label>
                                        <input required name="deliveryAddress" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold" value={extendedData.deliveryAddress} onChange={handleExtendedChange} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6 pt-4">
                                <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Truck size={18}/> Fulfillment
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Requirements</label>
                                        <textarea name="productsList" placeholder="Key produce list..." className="w-full p-4 bg-slate-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none h-28 resize-none font-medium" value={extendedData.productsList} onChange={handleExtendedChange} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade Days</label>
                                        <div className="flex flex-wrap gap-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (<button type="button" key={day} onClick={() => handleDayToggle(day)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${extendedData.deliveryDays.includes(day) ? 'bg-[#0B1221] text-white border-[#0B1221] shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>{day}</button>))}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6 pt-4">
                                <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <CreditCard size={18}/> Financials
                                </h3>
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${extendedData.accept7DayTerms ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 group-hover:border-indigo-400'}`}>
                                            {extendedData.accept7DayTerms && <Check size={16} strokeWidth={3}/>}
                                        </div>
                                        <input type="checkbox" name="accept7DayTerms" className="hidden" checked={extendedData.accept7DayTerms} onChange={handleCheckboxChange} />
                                        <span className="text-sm font-bold text-slate-700">I accept <strong>7-Day Net Terms</strong> via Marketplace direct-debit.</span>
                                    </label>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                        <button type="button" onClick={() => setShowTermsModal(true)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2"><BookOpen size={16}/> View Terms & Conditions</button>
                                        <div className="flex items-center gap-2">
                                            {termsAccepted ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1.5"><CheckCircle size={14}/> Accepted</span> : <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Awaiting Read</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-6 bg-[#0B1221] text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-[0.98]">Submit Full Onboarding</button>
                        </form>
                    </div>
                ) : (
                    <div className="text-center bg-white p-16 rounded-[3rem] shadow-2xl border border-emerald-100 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner-sm"><CheckCircle size={48} className="text-emerald-600"/></div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6 uppercase tracking-tight">Onboarding Dispatched!</h2>
                        <p className="text-lg text-slate-500 mb-12 max-w-md mx-auto font-medium">Platform Zero staff are reviewing your business data. Credentials will arrive via SMS and Email within 12 hours.</p>
                        <button onClick={handleBackToHome} className="px-12 py-4 bg-[#0B1221] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl">Back to Landing</button>
                    </div>
                )}
            </div>
        )}
      </div>

      {showTermsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[3rem] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Legal Provisions</h2>
                      <button onClick={() => setShowTermsModal(false)} className="text-slate-300 hover:text-slate-600 p-1"><X size={28}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-10 bg-slate-50 text-sm text-slate-600 leading-relaxed whitespace-pre-line font-serif">{TERMS_CONTENT}</div>
                  <div className="p-8 border-t border-gray-100 bg-white flex justify-end gap-3">
                      <button onClick={() => setShowTermsModal(false)} className="px-8 py-3 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                      <button onClick={handleAcceptTerms} className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-700 transition-all">I Agree & Accept</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
