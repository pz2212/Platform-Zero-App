
import React, { useState, useRef } from 'react';
import { 
  Upload, ArrowRight, CheckCircle, Calendar, DollarSign, 
  TrendingUp, FileText, Loader2, MapPin, Mail, Phone, 
  Building, User, Clock, Star, X, Table, ArrowDown, Rocket, ClipboardList, ShieldCheck, CreditCard, Truck, Users, BookOpen
} from 'lucide-react';
import { mockService } from '../services/mockDataService';
import { extractInvoiceItems, InvoiceItem } from '../services/geminiService';

interface ConsumerLandingProps {
  onLogin?: () => void;
}

const TERMS_CONTENT = `
Platform Zero Terms and Conditions

These Terms and Conditions govern the sale of fresh goods supplied by Platform Zero (“Platform Zero”) to the customer (“Customer”). By placing an order, the Customer agrees to be bound by these Terms.

1. Payment terms
Standard terms: Unless using Platform Zero’s American Express partnership, invoices must be paid within 7 days of the order date.
Extended terms via American Express: Customers seeking extended payment terms through Platform Zero’s American Express partnership must complete the onboarding process, including signing all required documentation.

2. Late payments
If there is an outstanding invoice Platform Zero reserves the right to:
- suspend fulfilment of further orders, and
- take legal action to recover outstanding amounts.
The Customer will be liable for all collection costs, including debt collector expenses, court costs, and solicitor fees.

3. Reporting issues
The Customer must notify Platform Zero within one hour of receiving goods if there are any issues (e.g. missing items, damaged goods, or quality concerns). Notification may be made via email, text, or the designated Platform Zero portal.
To qualify for credit on damaged or poor-quality goods, the Customer must:
- provide photographic evidence through the Platform Zero portal, and
- return affected goods where requested.
Without photographic evidence, no credit will be issued within 4 hours of receving the product.

4. Credits and replacements
Credits or replacements will only be processed once photographic evidence is provided.
Credits for quality issues are subject to return of the goods.
Claims must be made within 4 hours of receipt. No credits will be issued after this period.

5. Transport costs
Transport is included in product prices at the delivery location 10km radius of the CBD.

6. Pricing
Prices may fluctuate due to market conditions and seasonality. Where a price has been locked in, but the market rate increases by more than 25%, Platform Zero reserves the right to charge the current daily market rate.

7. Governing law
These Terms are governed by the laws of the jurisdiction in which Platform Zero operates.

8. Third-party processing
Platform Zero may use accredited third-party SQF processors for product cutting. Where products carry the processor’s label due to SQF’s requirements, the Customer must not purchase directly from the processor. If the Customer circumvents Platform Zero and orders directly, causing Platform Zero’s orders to decrease or cease, Platform Zero reserves the right to pursue legal action against both the Customer and the processor for loss of income.

9. Pre-orders
To ensure next-day delivery, Platform Zero pre-orders produce in advance to guarantee availability, quality, and on-time delivery.
If a Customer does not intend to place their usual order, they must provide Platform Zero with at least 7 days’ notice.
Where no order is placed and no notice is given, Platform Zero reserves the right to charge the Customer an amount equal to the average daily order value over the past three weeks.

10. Acceptance
By placing an order, the Customer acknowledges they have read, understood, and agree to comply with these Terms and Conditions. A signature is not required, Platform Zero’s terms are fully accepted from when the first order is made.

ABN 53 667 679 003
10-20 Gwynne St, Cremorne, VIC 3121
0413 470 925
commercial@platformzerosolutions.com
www.platformzero.com.au
`;

export const ConsumerLanding: React.FC<ConsumerLandingProps> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1=Form, 2=Analysing, 3=Results, 4=Booking
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Workflow State
  const [showBookingChoice, setShowBookingChoice] = useState(false);
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
  });

  // Extended Onboarding State
  const [extendedData, setExtendedData] = useState({
      abn: '',
      deliveryAddress: '',
      deliveryInstructions: '',
      // Operations
      productsList: '',
      deliveryDays: [] as string[],
      deliveryTimeSlot: '',
      // Key Contacts
      chefName: '',
      chefEmail: '',
      chefMobile: '',
      accountsEmail: '',
      accountsMobile: '',
      // Financials
      accept7DayTerms: false,
      want55DayTerms: false // Amex
  });

  // Validation Errors State
  const [errors, setErrors] = useState({
    weeklySpend: '',
    file: '',
    general: ''
  });

  // Calculation State
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

  const calculateAndProceed = async () => {
    let hasError = false;
    const newErrors = { weeklySpend: '', file: '', general: '' };

    if (!formData.weeklySpend) {
        newErrors.weeklySpend = 'Weekly spend is required to calculate savings.';
        hasError = true;
    }

    if (!file) {
        newErrors.file = 'Please upload a recent invoice to compare prices.';
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

                // AS SOON AS PRESSED: Submit lead to the system immediately
                mockService.submitConsumerSignup({
                    name: formData.name,
                    businessName: formData.businessName,
                    email: formData.email,
                    mobile: formData.mobile,
                    location: formData.location,
                    weeklySpend: parseFloat(formData.weeklySpend),
                    orderFrequency: formData.orderFreq,
                    invoiceFile: fullBase64,
                    isAutomatedLead: true // Flag to show it's an initial capture
                });

                // Then proceed with analysis UI for the user
                const realItems = await extractInvoiceItems(base64Data, mimeType);

                if (realItems && realItems.length > 0) {
                    setAnalyzedItems(realItems);
                    
                    const totalMarket = realItems.reduce((sum, i) => sum + (i.marketRate * i.qty), 0);
                    const totalPZ = realItems.reduce((sum, i) => sum + (i.pzRate * i.qty), 0);
                    const realSavingRate = totalMarket > 0 ? (totalMarket - totalPZ) / totalMarket : 0.18;

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
            
            reader.onerror = () => runSimulation();
            reader.readAsDataURL(file);
        } else {
            runSimulation();
        }
    } catch (e) {
        runSimulation();
    }
  };

  const runSimulation = () => {
    setTimeout(() => {
      const spend = parseFloat(formData.weeklySpend);
      const savingRate = 0.18; 
      
      const weeklySave = spend * savingRate;
      
      setSavings({
        weekly: weeklySave,
        monthly: weeklySave * 4.33,
        annually: weeklySave * 52
      });

      const products = [
          { name: 'Premium Tomatoes (Truss)', mkt: 9.90, pz: 8.40 },
          { name: 'Avocados (Tray 20ct)', mkt: 45.00, pz: 38.50 },
          { name: 'Free Range Eggs (Dozen)', mkt: 5.50, pz: 4.20 },
          { name: 'Barista Milk (2L)', mkt: 3.80, pz: 3.10 },
          { name: 'Sourdough Loaf (Unit)', mkt: 8.50, pz: 6.90 },
          { name: 'Mushrooms (Swiss Brown)', mkt: 14.00, pz: 11.50 }
      ];

      const factor = spend / 1500;
      const multiplier = factor < 0.5 ? 0.5 : factor;

      const items = products.map(p => ({
          name: p.name,
          qty: Math.round((Math.random() * 5 + 5) * multiplier),
          marketRate: p.mkt,
          pzRate: p.pz
      }));
      
      setAnalyzedItems(items);
      setStep(3);
    }, 2500);
  };

  const handleBookingClick = () => {
      setShowBookingChoice(true);
  };

  const handleOpenCalendly = () => {
    window.open('http://calendly.com/alex-platformzerosolutions', '_blank');
    setShowBookingChoice(false);
  };

  const handleStartToday = () => {
      setShowBookingChoice(false);
      setShowOnboardingForm(true);
      setExtendedData(prev => ({
          ...prev,
          deliveryAddress: formData.location 
      }));
  };

  const handleAcceptTerms = () => {
      setTermsAccepted(true);
      setShowTermsModal(false);
  };

  const submitFinalOnboarding = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!extendedData.accept7DayTerms) {
          alert("Please accept the 7-day payment terms to proceed.");
          return;
      }

      if (!termsAccepted) {
          alert("Please read and accept the Platform Zero Terms & Conditions to proceed.");
          return;
      }

      // Convert file to base64 to ensure it's saved in the mock request record
      let invoiceBase64 = '';
      if (file) {
          invoiceBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
          });
      }

      mockService.submitConsumerSignup({
        name: formData.name,
        businessName: formData.businessName,
        email: formData.email,
        mobile: formData.mobile,
        location: extendedData.deliveryAddress || formData.location,
        weeklySpend: parseFloat(formData.weeklySpend),
        orderFrequency: formData.orderFreq,
        ...extendedData,
        invoiceFile: invoiceBase64
      });

      setShowOnboardingForm(false);
      setOnboardingComplete(true);
  };

  const handleBackToHome = () => {
      setStep(1);
      setFile(null);
      setShowBookingChoice(false);
      setShowOnboardingForm(false);
      setOnboardingComplete(false);
      setTermsAccepted(false);
      setFormData({
        businessName: '',
        location: '',
        email: '',
        name: '',
        mobile: '',
        weeklySpend: '',
        orderFreq: '1-2 (Weekly)',
      });
      setExtendedData({
          abn: '',
          deliveryAddress: '',
          deliveryInstructions: '',
          productsList: '',
          deliveryDays: [],
          deliveryTimeSlot: '',
          chefName: '',
          chefEmail: '',
          chefMobile: '',
          accountsEmail: '',
          accountsMobile: '',
          accept7DayTerms: false,
          want55DayTerms: false
      });
      setSavings({
        weekly: 0,
        monthly: 0,
        annually: 0
      });
      setAnalyzedItems([]);
      setErrors({ weeklySpend: '', file: '', general: '' });
      window.scrollTo(0,0);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col relative">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
           <span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>
        <div className="text-sm font-medium text-gray-500">
           Already a member? 
           <button 
             onClick={onLogin} 
             className="text-emerald-600 hover:text-emerald-700 font-bold ml-1"
           >
             Log in
           </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12 flex-1 relative z-0">
        
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Stop overpaying for <span className="text-emerald-600">fresh produce.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join the marketplace connecting restaurants directly to farms and wholesalers. Upload your invoice, and we'll show you exactly how much you'll save.
              </p>
              
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-emerald-500" size={24} />
                    <span className="font-medium">Direct-to-source pricing</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-emerald-500" size={24} />
                    <span className="font-medium">Consolidated billing & logistics</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="text-emerald-500" size={24} />
                    <span className="font-medium">Reduce food waste & carbon footprint</span>
                 </div>
              </div>

              <div className="mt-10 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 inline-block">
                 <p className="font-bold text-emerald-900 flex items-center gap-2 mb-1">
                    <Star size={18} fill="currentColor" /> Limited Offer
                 </p>
                 <p className="text-emerald-800 text-sm">
                    Analyse your invoice today and get instant results. Our team will capture your lead and prepare a custom quote.
                 </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Get Your Savings Analysis</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" name="name" 
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                placeholder="John Doe"
                                value={formData.name} onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="tel" name="mobile" 
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                placeholder="0400 000 000"
                                value={formData.mobile} onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name</label>
                    <div className="relative">
                        <Building size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            type="text" name="businessName" 
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                            placeholder="The Morning Cafe"
                            value={formData.businessName} onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="email" name="email" 
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                placeholder="john@cafe.com"
                                value={formData.email} onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" name="location" 
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                placeholder="Melbourne, VIC"
                                value={formData.location} onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weekly Spend ($)</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="number" name="weeklySpend" 
                                className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans ${errors.weeklySpend ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}
                                placeholder="2500"
                                value={formData.weeklySpend} onChange={handleInputChange}
                            />
                        </div>
                        {errors.weeklySpend && <p className="text-red-500 text-xs mt-1">{errors.weeklySpend}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Orders / Month</label>
                        <div className="relative">
                            <Clock size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <select 
                                name="orderFreq" 
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans appearance-none"
                                value={formData.orderFreq} onChange={handleInputChange}
                            >
                                <option>1-2 (Weekly)</option>
                                <option>3-5 (Weekly)</option>
                                <option>Daily</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Recent Invoice</label>
                    <label 
                        htmlFor="invoice-upload"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all group relative cursor-pointer block ${
                            isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' :
                            errors.file ? 'border-red-300 bg-red-50' :
                            file ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                        }`}
                    >
                        <input 
                            id="invoice-upload"
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            onChange={handleFileChange}
                            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                        />
                        
                        {file ? (
                            <div className="flex flex-col items-center animate-in zoom-in duration-200">
                                <div className="bg-emerald-100 p-3 rounded-full mb-2">
                                    <CheckCircle size={32} className="text-emerald-600" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">Ready to analyse</p>
                                <button 
                                    onClick={removeFile}
                                    className="mt-3 text-xs text-red-500 hover:text-red-700 font-bold hover:underline z-10"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <Upload size={24} className="text-gray-400 group-hover:text-emerald-500" />
                                </div>
                                <span className="text-gray-900 font-bold text-sm">Click to upload or drag and drop</span>
                                <span className="text-gray-500 text-xs mt-1">PDF or Image to compare prices</span>
                            </div>
                        )}
                    </label>
                    {errors.file && <p className="text-red-500 text-xs mt-1 text-center">{errors.file}</p>}
                </div>

                <button 
                    onClick={calculateAndProceed}
                    className="w-full py-4 bg-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group mt-2"
                >
                    Analyse & See Savings <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500 text-center">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                    <div className="w-24 h-24 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    <Loader2 size={40} className="text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-2">Analysing Your Invoice...</h2>
                <p className="text-gray-500 max-w-md">Our AI is extracting line items, matching varieties, and comparing your current rates against the Platform Zero marketplace.</p>
            </div>
        )}

        {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">Analysis Complete</span>
                    <h2 className="text-4xl font-extrabold text-gray-900">Your Potential Savings</h2>
                    <p className="text-gray-500 mt-2">Based on your weekly spend of ${formData.weeklySpend}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg text-center transform hover:scale-105 transition-transform">
                        <p className="text-gray-500 font-medium mb-1">Weekly Savings</p>
                        <h3 className="text-3xl font-extrabold text-emerald-600">${savings.weekly.toFixed(0)}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg text-center transform hover:scale-105 transition-transform relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
                        <p className="text-gray-500 font-medium mb-1">Annual Savings</p>
                        <h3 className="text-4xl font-extrabold text-gray-900">${savings.annually.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg text-center transform hover:scale-105 transition-transform">
                        <p className="text-gray-500 font-medium mb-1">Monthly Savings</p>
                        <h3 className="text-3xl font-extrabold text-indigo-600">${savings.monthly.toFixed(0)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-12">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={20} className="text-gray-400"/> Price Breakdown
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4 text-right">Your Price</th>
                                    <th className="px-6 py-4 text-right text-emerald-700">PZ Price</th>
                                    <th className="px-6 py-4 text-right">Savings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {analyzedItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 text-right text-gray-500 decoration-gray-300 line-through">${item.marketRate.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">${item.pzRate.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{((1 - item.pzRate / item.marketRate) * 100).toFixed(0)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={() => setStep(4)}
                        className="px-12 py-4 bg-emerald-600 text-white rounded-full font-bold text-xl shadow-xl hover:bg-emerald-700 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        Unlock These Prices <ArrowRight size={24}/>
                    </button>
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 font-sans">
                {!showOnboardingForm && !onboardingComplete ? (
                    <div className="text-center space-y-8">
                        <div><h2 className="text-3xl font-bold text-gray-900 mb-4">How would you like to proceed?</h2><p className="text-gray-500">You can start ordering immediately or book a call with our team.</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={handleStartToday} className="bg-white p-8 rounded-2xl border-2 border-emerald-500 shadow-lg hover:shadow-xl transition-all group text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform"><Rocket size={24}/></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Today</h3>
                                <p className="text-sm text-gray-500 mb-4">Complete your profile and access the marketplace instantly.</p>
                                <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">Create Account <ArrowRight size={16}/></span>
                            </button>
                            <button onClick={handleBookingClick} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group text-left">
                                <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform"><Calendar size={24}/></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Book a Demo</h3>
                                <p className="text-sm text-gray-500 mb-4">Schedule a 15-min call with a specialist to walk you through the platform.</p>
                                <span className="text-indigo-600 font-bold text-sm flex items-center gap-1">Select Time <ArrowRight size={16}/></span>
                            </button>
                        </div>
                        {showBookingChoice && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                                <div className="bg-white w-full max-w-lg rounded-xl p-8 text-center animate-in zoom-in-95">
                                    <Calendar size={48} className="mx-auto text-indigo-600 mb-4"/><h3 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Demo</h3><p className="text-gray-500 mb-6">We'll redirect you to our calendar to pick a time that works best.</p>
                                    <div className="flex gap-3 justify-center"><button onClick={() => setShowBookingChoice(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Cancel</button><button onClick={handleOpenCalendly} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Open Calendar</button></div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : !onboardingComplete ? (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4"><h2 className="text-2xl font-bold text-gray-900">Complete Business Profile</h2><button onClick={() => setShowOnboardingForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button></div>
                        <form onSubmit={submitFinalOnboarding} className="space-y-6 font-sans">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2"><Building size={16} className="text-emerald-600"/> Business Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required name="abn" placeholder="ABN / Tax ID" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-sans" value={extendedData.abn} onChange={handleExtendedChange} />
                                    <input required name="deliveryAddress" placeholder="Full Delivery Address" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-sans" value={extendedData.deliveryAddress} onChange={handleExtendedChange} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2"><Truck size={16} className="text-emerald-600"/> Operations</h3>
                                <div className="space-y-4">
                                    <textarea name="productsList" placeholder="Commonly ordered products..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none font-sans" value={extendedData.productsList} onChange={handleExtendedChange} />
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Delivery Days</label>
                                        <div className="flex flex-wrap gap-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (<button type="button" key={day} onClick={() => handleDayToggle(day)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${extendedData.deliveryDays.includes(day) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{day}</button>))}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2"><CreditCard size={16} className="text-emerald-600"/> Terms & Conditions</h3>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"><input type="checkbox" name="accept7DayTerms" className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" checked={extendedData.accept7DayTerms} onChange={handleCheckboxChange} /><span className="text-sm text-gray-700">I agree to <strong>7-Day Payment Terms</strong>.</span></label>
                                    <div className="flex items-center justify-between pt-2">
                                        <button type="button" onClick={() => setShowTermsModal(true)} className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1"><BookOpen size={16}/> Read Terms</button>
                                        <div className="text-sm text-gray-500">{termsAccepted ? <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Accepted</span> : <span className="text-red-500 font-bold">Pending</span>}</div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all">Submit Application</button>
                        </form>
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-emerald-100 animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} className="text-emerald-600"/></div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Application Received!</h2>
                        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">Thank you, {formData.name}. Our team is reviewing your profile. You will receive an email shortly with login credentials.</p>
                        <button onClick={handleBackToHome} className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">Back to Home</button>
                    </div>
                )}
            </div>
        )}
      </div>

      {showTermsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2><button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button></div>
                  <div className="flex-1 overflow-y-auto p-8 bg-gray-50 text-sm text-gray-700 leading-relaxed whitespace-pre-line font-serif">{TERMS_CONTENT}</div>
                  <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-3"><button onClick={() => setShowTermsModal(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Cancel</button><button onClick={handleAcceptTerms} className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-sm">I Accept</button></div>
              </div>
          </div>
      )}
    </div>
  );
};
