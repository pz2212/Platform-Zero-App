
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification } from './types';
import { mockService } from './services/mockDataService';
import { Dashboard } from './components/Dashboard';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { Inventory } from './components/Inventory';
import { ProductPricing } from './components/ProductPricing';
import { Marketplace } from './components/Marketplace';
import { SupplierMarket } from './components/SupplierMarket';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { RepDashboard } from './components/RepDashboard';
import { Settings as SettingsComponent } from './components/Settings';
import { LoginRequests } from './components/LoginRequests';
import { ConsumerOnboarding } from './components/ConsumerOnboarding';
import { CustomerPortals } from './components/CustomerPortals';
import { AiOpportunityMatcher } from './components/AiOpportunityMatcher';
import { Accounts } from './components/Accounts';
import { PricingRequests } from './components/PricingRequests';
import { AdminPriceRequests } from './components/AdminPriceRequests';
import { ConsumerLanding } from './components/ConsumerLanding';
import { SellerDashboardV1 } from './components/SellerDashboardV1';
import { CustomerOrders } from './components/CustomerOrders'; 
import { AdminRepManagement } from './components/AdminRepManagement';
import { TradingInsights } from './components/TradingInsights';
import { AdminSuppliers } from './components/AdminSuppliers';
import { Contacts } from './components/Contacts';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Tags,
  ChevronDown,
  ChevronRight,
  UserPlus,
  ClipboardList, 
  ScanLine, 
  DollarSign, 
  Store, 
  X, 
  Lock, 
  ArrowLeft, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Bell, 
  Award,
  ShoppingBag,
  Sprout,
  Handshake,
  ShieldCheck,
  TrendingUp,
  Target,
  Plus,
  ChevronUp,
  BarChart4,
  Layers,
  FileText,
  Gift,
  Truck,
  Sparkles,
  Calculator,
  Clock,
  Building,
  User as UserIcon,
  MessageCircle,
  Menu as HamburgerIcon
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick, isSubItem = false, badge = 0, subLabel }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
      active 
        ? 'bg-emerald-50 text-[#043003] font-bold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    } ${isSubItem ? 'pl-10 py-2.5 text-sm' : ''}`}
  >
    <div className="flex items-center space-x-3 min-w-0">
        <Icon size={isSubItem ? 16 : 20} className={active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500 transition-colors'} />
        <div className="truncate">
          <span className="block truncate">{label}</span>
          {subLabel && <span className="block text-[9px] font-black text-gray-400 uppercase tracking-tighter">{subLabel}</span>}
        </div>
    </div>
    {badge > 0 && (
        <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shrink-0">
            {badge}
        </span>
    )}
  </Link>
);

const NotificationDropdown = ({ user, onClose }: { user: User, onClose: () => void }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setNotifications(mockService.getAppNotifications(user.id));
        const interval = setInterval(() => {
            setNotifications(mockService.getAppNotifications(user.id));
        }, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleRead = (notif: AppNotification) => {
        mockService.markNotificationAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
        }
        onClose();
    };

    const handleReadAll = () => {
        mockService.markAllNotificationsRead(user.id);
        setNotifications(mockService.getAppNotifications(user.id));
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] animate-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Bell size={14} className="text-emerald-600"/> Notifications
                </h3>
                <button onClick={handleReadAll} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Mark all read</button>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Bell size={32} className="mx-auto mb-3 opacity-20"/>
                        <p className="text-xs font-bold uppercase tracking-widest">No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => handleRead(n)}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-emerald-50/30 relative group ${!n.isRead ? 'bg-white' : 'bg-gray-50/20'}`}
                        >
                            {!n.isRead && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                    n.type === 'ORDER' ? 'bg-blue-100 text-blue-600' :
                                    n.type === 'APPLICATION' ? 'bg-orange-100 text-orange-600' :
                                    n.type === 'PRICE_REQUEST' ? 'bg-indigo-100 text-indigo-600' :
                                    'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {n.type === 'ORDER' ? <ShoppingCart size={20}/> :
                                     n.type === 'APPLICATION' ? <UserPlus size={20}/> :
                                     n.type === 'PRICE_REQUEST' ? <Calculator size={20}/> :
                                     <Sparkles size={20}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className="text-sm font-black text-gray-900 truncate pr-4">{n.title}</p>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter whitespace-nowrap pt-0.5">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-snug line-clamp-2">{n.message}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {notifications.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <button onClick={onClose} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Dismiss</button>
                </div>
            )}
        </div>
    );
};

const NetworkSignalsWidget = ({ user, mode = 'sidebar', onFinish }: { user: User, mode?: 'sidebar' | 'popup', onFinish?: () => void }) => {
  const [sellingTags, setSellingTags] = useState<string[]>(user.activeSellingInterests || []);
  const [buyingTags, setBuyingTags] = useState<string[]>(user.activeBuyingInterests || []);
  const [sellInput, setSellInput] = useState('');
  const [buyInput, setBuyInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = (type: 'sell' | 'buy') => {
    if (type === 'sell' && sellInput.trim()) {
      const newTags = [...sellingTags, sellInput.trim()];
      setSellingTags(newTags);
      setSellInput('');
      mockService.updateUserInterests(user.id, newTags, buyingTags);
    } else if (type === 'buy' && buyInput.trim()) {
      const newTags = [...buyingTags, buyInput.trim()];
      setBuyingTags(newTags);
      setBuyInput('');
      mockService.updateUserInterests(user.id, sellingTags, newTags);
    }
  };

  const handleRemove = (type: 'sell' | 'buy', tag: string) => {
    if (type === 'sell') {
      const newTags = sellingTags.filter(t => t !== tag);
      setSellingTags(newTags);
      mockService.updateUserInterests(user.id, newTags, buyingTags);
    } else {
      const newTags = buyingTags.filter(t => t !== tag);
      setBuyingTags(newTags);
      mockService.updateUserInterests(user.id, sellingTags, newTags);
    }
  };

  const widgetContent = (
    <div className="overflow-hidden w-full">
       <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 px-1">
         <span>Daily Signals</span>
         {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronUp size={14} className="text-slate-500" />}
       </button>
       {isExpanded && (
         <div className="mt-4 space-y-4 px-1">
            <div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#10B981] mb-2 uppercase tracking-wide"><TrendingUp size={12}/> Selling Today</div>
               <div className="flex items-center gap-1.5 mb-3 h-8 w-full overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <input 
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-md px-2 py-1 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-bold" 
                      placeholder="Apples" 
                      value={sellInput} 
                      onChange={e => setSellInput(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAdd('sell')} 
                    />
                  </div>
                  <button onClick={() => handleAdd('sell')} className="bg-[#043003] hover:bg-black text-white rounded-md w-8 h-full flex items-center justify-center transition-colors shadow-lg border border-emerald-900/50 shrink-0"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5">
                 {sellingTags.map(tag => (
                   <div key={tag} className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold animate-in zoom-in-95">
                     {tag}
                     <button onClick={() => handleRemove('sell', tag)} className="hover:text-emerald-200 transition-colors">
                       <X size={10}/>
                     </button>
                   </div>
                 ))}
               </div>
            </div>
            <div>
               <div className="flex items-center gap-2 text-[10px] font-black text-[#3B82F6] mb-2 uppercase tracking-wide"><Target size={12}/> Buying Today</div>
               <div className="flex items-center gap-1.5 mb-3 h-8 w-full overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <input 
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-md px-2 py-1 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold" 
                      placeholder="Packing" 
                      value={buyInput} 
                      onChange={e => setBuyInput(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAdd('buy')} 
                    />
                  </div>
                  <button onClick={() => handleAdd('buy')} className="bg-[#3B82F6] hover:bg-blue-600 text-white rounded-md w-8 h-full flex items-center justify-center transition-colors shadow-lg border border-blue-900/50 shrink-0"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-1.5">
                 {buyingTags.map(tag => (
                   <div key={tag} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold animate-in zoom-in-95">
                     {tag}
                     <button onClick={() => handleRemove('buy', tag)} className="hover:text-blue-200 transition-colors">
                       <X size={10}/>
                     </button>
                   </div>
                 ))}
               </div>
            </div>
            {mode === 'popup' && (
                <button 
                  onClick={onFinish}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all border border-slate-700"
                >
                    Done for Now
                </button>
            )}
         </div>
       )}
    </div>
  );

  if (mode === 'popup') {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-[#0B1221] rounded-3xl p-8 text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Market Status</h2>
                        <p className="text-slate-500 text-sm mt-1">Set your signals for {new Date().toLocaleDateString()}</p>
                    </div>
                    <button onClick={onFinish} className="text-slate-600 hover:text-white p-1 transition-colors"><X size={24}/></button>
                </div>
                {widgetContent}
            </div>
        </div>
    );
  }

  return (
    <div className="mt-auto px-3 pb-4">
        <div className="bg-[#0B1221] rounded-2xl p-4 text-white shadow-xl border border-slate-800 overflow-hidden">
            {widgetContent}
        </div>
    </div>
  );
};

const AppLayout = ({ children, user, onLogout }: any) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isActive = (path: string) => location.pathname === path;
  const isChatActive = (id: string) => location.pathname === '/contacts' && queryParams.get('id') === id;
  
  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMarketplaceMenuOpen, setIsMarketplaceMenuOpen] = useState(true);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [directory, setDirectory] = useState<User[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Quote Notification Count (Admin)
  const submittedQuotesCount = mockService.getAllSupplierPriceRequests().filter(r => r.status === 'SUBMITTED').length;

  useEffect(() => {
    if (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) {
        const today = new Date().toLocaleDateString();
        const lastSeen = localStorage.getItem(`pz_daily_signal_${user.id}`);
        if (lastSeen !== today) {
            setShowDailyPopup(true);
        }
    }
    // Fetch contacts for sidebar
    setDirectory(mockService.getWholesalers().filter(u => u.id !== user.id));
  }, [user]);

  useEffect(() => {
    const updateNotifs = () => {
        const notifs = mockService.getAppNotifications(user.id);
        setNotifCount(notifs.filter(n => !n.isRead).length);
    };
    updateNotifs();
    const interval = setInterval(updateNotifs, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node)) {
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClosePopup = () => {
      const today = new Date().toLocaleDateString();
      localStorage.setItem(`pz_daily_signal_${user.id}`, today);
      setShowDailyPopup(false);
  };

  const isPartner = user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER;

  const NavItems = () => (
    <div className="flex-1 py-4 px-3 space-y-1 flex flex-col no-scrollbar">
          <div className="flex-1 space-y-1">
              {user.role === UserRole.ADMIN ? (
                  <>
                    <div className="pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Admin</div>
                    <SidebarLink to="/" icon={LayoutDashboard} label="Overview" active={isActive('/')} onClick={() => setIsMobileNavOpen(false)} />
                    
                    {/* Elevated Quote Generator for better accessibility */}
                    <SidebarLink 
                        to="/pricing-requests" 
                        icon={Calculator} 
                        label="Quote Generator" 
                        active={isActive('/pricing-requests')} 
                        onClick={() => setIsMobileNavOpen(false)} 
                    />

                    <div className="space-y-1">
                        <button 
                            onClick={() => setIsMarketplaceMenuOpen(!isMarketplaceMenuOpen)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 ${isMarketplaceMenuOpen ? 'bg-gray-50/50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <Handshake size={20} className="text-gray-400" />
                                <span className="font-medium">Admin Console</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isMarketplaceMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isMarketplaceMenuOpen && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                                <SidebarLink to="/marketplace" icon={Layers} label="Catalog Manager" active={isActive('/marketplace')} isSubItem onClick={() => setIsMobileNavOpen(false)} />
                                <SidebarLink to="/consumer-onboarding" icon={Users} label="Customers" active={isActive('/consumer-onboarding')} isSubItem onClick={() => setIsMobileNavOpen(false)} />
                                <SidebarLink to="/admin/suppliers" icon={Store} label="Suppliers" active={isActive('/admin/suppliers')} isSubItem onClick={() => setIsMobileNavOpen(false)} />
                                <SidebarLink 
                                    to="/login-requests" 
                                    icon={UserPlus} 
                                    label="Lead Requests" 
                                    active={isActive('/login-requests')} 
                                    isSubItem 
                                    badge={mockService.getRegistrationRequests().filter(r => r.status === 'Pending').length}
                                    onClick={() => setIsMobileNavOpen(false)}
                                />
                                <SidebarLink 
                                    to="/admin/negotiations" 
                                    icon={Tags} 
                                    label="Price Requests" 
                                    active={isActive('/admin/negotiations')} 
                                    isSubItem 
                                    badge={submittedQuotesCount}
                                    onClick={() => setIsMobileNavOpen(false)}
                                />
                            </div>
                        )}
                    </div>

                    <SidebarLink to="/customer-portals" icon={Gift} label="Growth & Portals" active={isActive('/customer-portals')} onClick={() => setIsMobileNavOpen(false)} />
                    <SidebarLink to="/admin-reps" icon={Award} label="Rep Management" active={isActive('/admin-reps')} onClick={() => setIsMobileNavOpen(false)} />
                  </>
              ) : user.role === UserRole.CONSUMER ? (
                <>
                    <div className="pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Buyer Portal</div>
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} onClick={() => setIsMobileNavOpen(false)} />
                    <SidebarLink to="/orders" icon={ShoppingCart} label="Track Orders" active={isActive('/orders')} onClick={() => setIsMobileNavOpen(false)} />
                    <SidebarLink to="/marketplace" icon={ShoppingBag} label="Fresh Catalog" active={isActive('/marketplace')} onClick={() => setIsMobileNavOpen(false)} />
                </>
              ) : isPartner ? (
                <>
                  <div className="pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role === UserRole.FARMER ? 'Farmer Operations' : 'Wholesaler Ops'}</div>
                  <SidebarLink to="/" icon={LayoutDashboard} label="Order Management" active={isActive('/')} badge={mockService.getOrders(user.id).filter(o => o.sellerId === user.id && o.status === 'Pending').length} onClick={() => setIsMobileNavOpen(false)} />
                  <SidebarLink to="/pricing" icon={Tags} label="Inventory & Price" active={isActive('/pricing')} onClick={() => setIsMobileNavOpen(false)} />
                  <SidebarLink to="/accounts" icon={DollarSign} label="Financials" active={isActive('/accounts')} onClick={() => setIsMobileNavOpen(false)} />
                  <SidebarLink to="/trading-insights" icon={BarChart4} label="Market Intelligence" active={isActive('/trading-insights')} onClick={() => setIsMobileNavOpen(false)} />
                  
                  <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network</div>
                  <SidebarLink to="/market" icon={Store} label="Supplier Market" active={isActive('/market')} onClick={() => setIsMobileNavOpen(false)} />
                  
                  <div className="pt-8 pb-3 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Contacts</div>
                  <SidebarLink to="/contacts" icon={Users} label="Directory" active={isActive('/contacts') && !queryParams.get('id')} onClick={() => setIsMobileNavOpen(false)} />
                  {directory.map(s => (
                    <SidebarLink 
                      key={s.id} 
                      to={`/contacts?id=${s.id}`} 
                      icon={() => (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-500 transition-colors"></div>
                        </div>
                      )}
                      label={s.businessName} 
                      subLabel={s.role === UserRole.FARMER ? 'Farmer' : 'Wholesaler'}
                      active={isChatActive(s.id)} 
                      onClick={() => setIsMobileNavOpen(false)}
                    />
                  ))}
                </>
              ) : user.role === UserRole.DRIVER ? (
                <>
                    <SidebarLink to="/" icon={Truck} label="Run Sheet" active={isActive('/')} onClick={() => setIsMobileNavOpen(false)} />
                </>
              ) : user.role === UserRole.PZ_REP ? (
                <>
                    <SidebarLink to="/" icon={Briefcase} label="Sales Console" active={isActive('/')} onClick={() => setIsMobileNavOpen(false)} />
                </>
              ) : null}
              
              <div className="pt-4 border-t border-gray-100">
                <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} onClick={() => setIsMobileNavOpen(false)} />
              </div>
          </div>

          {isPartner && !showDailyPopup && <NetworkSignalsWidget user={user} mode="sidebar" />}
          
          <div className="p-4 mt-4 border-t border-gray-100 md:hidden">
             <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-2 text-red-600 font-bold text-sm"><LogOut size={18} /><span>Sign Out</span></button>
          </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-30">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
            <NavItems />
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold"><LogOut size={18} /><span>Sign Out</span></button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
            <span className="font-bold text-lg tracking-tight text-gray-900">Platform Zero</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="p-2 text-gray-500 relative"
                >
                    <Bell size={22} />
                    {notifCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </button>
                {showNotifDropdown && <NotificationDropdown user={user} onClose={() => setShowNotifDropdown(false)} />}
              </div>
              <button 
                onClick={() => setIsMobileNavOpen(true)}
                className="p-2 text-gray-900 bg-gray-50 rounded-xl"
              >
                  <HamburgerIcon size={24}/>
              </button>
          </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
              <div 
                ref={mobileNavRef}
                className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100"
              >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-black text-gray-900 uppercase text-xs tracking-widest">Navigation</h2>
                      <button onClick={() => setIsMobileNavOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                      <NavItems />
                  </div>
              </div>
          </div>
      )}
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 w-full overflow-x-hidden relative mt-16 md:mt-0">
        <div className="hidden md:flex justify-end mb-6 sticky top-0 md:absolute md:top-8 md:right-8 z-40 bg-gray-50/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-0 py-2 md:py-0 -mx-4 md:mx-0 px-4 md:px-0">
            <div className="flex items-center gap-3">
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                        className={`p-2.5 rounded-full transition-all shadow-sm border ${showNotifDropdown ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Bell size={18} className={notifCount > 0 ? "animate-swing" : ""}/>
                        {notifCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                                {notifCount}
                            </span>
                        )}
                    </button>
                    {showNotifDropdown && <NotificationDropdown user={user} onClose={() => setShowNotifDropdown(false)} />}
                </div>

                {isPartner && (
                    <Link 
                        to="/trading-insights"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-sm border ${
                            isActive('/trading-insights')
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <BarChart4 size={14} className={isActive('/trading-insights') ? 'text-emerald-400' : 'text-slate-400'}/>
                        Market Intelligence
                        {isActive('/trading-insights') && <Sparkles size={12} className="text-emerald-400 animate-pulse"/>}
                    </Link>
                )}
            </div>
        </div>

        <div className={isPartner ? "md:mt-12" : ""}>
            {children}
        </div>
        
        {isPartner && showDailyPopup && (
            <NetworkSignalsWidget user={user} mode="popup" onFinish={handleClosePopup} />
        )}
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'select' | 'role_select' | 'form'>('select');
  const [portalType, setPortalType] = useState<'PARTNER' | 'MARKETPLACE' | 'ADMIN'>('PARTNER');
  const [subRole, setSubRole] = useState<'WHOLESALER' | 'FARMER' | null>(null);
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = mockService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
        setUser(found);
        setShowLoginModal(false);
        setLoginStep('select');
    } else {
        alert(`Account not found. Tip: Try '${subRole === 'FARMER' ? 'bob@greenvalley.com' : 'sarah@fresh.com'}' for demo access.`);
    }
  };

  const selectPortal = (type: 'PARTNER' | 'MARKETPLACE' | 'ADMIN') => {
      setPortalType(type);
      if (type === 'PARTNER') {
          setLoginStep('role_select');
      } else {
          setLoginStep('form');
          if (type === 'ADMIN') setEmail('admin@pz.com');
          else setEmail('alice@cafe.com');
      }
  };

  const selectSubRole = (role: 'WHOLESALER' | 'FARMER') => {
      setSubRole(role);
      setLoginStep('form');
      if (role === 'WHOLESALER') setEmail('sarah@fresh.com');
      else setEmail('bob@greenvalley.com');
  };

  const resetModal = () => {
      setShowLoginModal(false);
      setLoginStep('select');
      setEmail('');
      setSubRole(null);
  };

  return (
    <Router>
      {!user ? (
        <>
            <ConsumerLanding onLogin={() => setShowLoginModal(true)} />
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        
                        {loginStep === 'select' ? (
                            <>
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                                    <button onClick={resetModal} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                                </div>
                                <div className="p-6 space-y-4 bg-white">
                                    <p className="text-gray-500 text-sm font-medium mb-2">Please select your portal to continue.</p>
                                    
                                    <button 
                                        onClick={() => selectPortal('PARTNER')}
                                        className="w-full text-left p-5 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group flex items-center gap-4"
                                    >
                                        <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                                            <Briefcase size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">Partners</h3>
                                            <p className="text-sm text-gray-500">Wholesalers & Farmers</p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>

                                    <button 
                                        onClick={() => selectPortal('MARKETPLACE')}
                                        className="w-full text-left p-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group flex items-center gap-4"
                                    >
                                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                                            <ShoppingCart size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">Marketplace</h3>
                                            <p className="text-sm text-gray-500">Buyers & Consumers</p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                                    <button 
                                        onClick={() => selectPortal('ADMIN')}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-2 uppercase tracking-widest py-2 transition-colors"
                                    >
                                        <Lock size={14} /> Admin & Staff Access
                                    </button>
                                </div>
                            </>
                        ) : loginStep === 'role_select' ? (
                            <>
                                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                                    <button onClick={() => setLoginStep('select')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20}/></button>
                                    <h2 className="text-xl font-bold text-gray-900">Partner Login</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <button 
                                        onClick={() => selectSubRole('WHOLESALER')}
                                        className="w-full text-left p-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <Building size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">Wholesaler Portal</h3>
                                            <p className="text-xs text-gray-500">Manage inventory & staff</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => selectSubRole('FARMER')}
                                        className="w-full text-left p-5 border border-gray-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                            <Sprout size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">Farmer Portal</h3>
                                            <p className="text-xs text-gray-500">Manage harvest & direct sales</p>
                                        </div>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                                    <button onClick={() => portalType === 'PARTNER' ? setLoginStep('role_select') : setLoginStep('select')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20}/></button>
                                    <h2 className="text-xl font-bold text-gray-900">Sign in to {subRole ? `${subRole.charAt(0) + subRole.slice(1).toLowerCase()} Portal` : portalType.charAt(0) + portalType.slice(1).toLowerCase()}</h2>
                                </div>
                                <form onSubmit={handleLogin} className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Email Address</label>
                                        <input 
                                            type="email" 
                                            autoFocus
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-lg text-black" 
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-[#043003] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-[#064004] transition-all">Continue</button>
                                    <p className="text-xs text-center text-gray-400 italic">
                                        Demo accounts are pre-filled based on your selection.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
      ) : (
        <AppLayout user={user} onLogout={() => setUser(null)}>
            <Routes>
                <Route path="/" element={
                  user.role === UserRole.ADMIN ? <AdminDashboard /> : 
                  user.role === UserRole.CONSUMER ? <ConsumerDashboard user={user} /> :
                  user.role === UserRole.DRIVER ? <DriverDashboard user={user} /> :
                  user.role === UserRole.PZ_REP ? <RepDashboard user={user} /> :
                  user.role === UserRole.FARMER ? <FarmerDashboard user={user} /> :
                  user.dashboardVersion === 'v1' ? <SellerDashboardV1 user={user} /> : <Dashboard user={user} />
                } />
                <Route path="/marketplace" element={<Marketplace user={user} />} />
                <Route path="/login-requests" element={<LoginRequests />} />
                <Route path="/pricing-requests" element={<PricingRequests user={user} />} />
                <Route path="/admin/negotiations" element={<AdminPriceRequests />} />
                <Route path="/consumer-onboarding" element={<ConsumerOnboarding />} />
                <Route path="/admin/suppliers" element={<AdminSuppliers />} />
                <Route path="/customer-portals" element={<CustomerPortals />} />
                <Route path="/admin-reps" element={<AdminRepManagement />} />
                <Route path="/trading-insights" element={<TradingInsights user={user} />} />
                <Route path="/pricing" element={<ProductPricing user={user} />} />
                <Route path="/inventory" element={<Inventory items={mockService.getInventory(user.id)} />} />
                <Route path="/market" element={<SupplierMarket user={user} />} />
                <Route path="/ai-matcher" element={<AiOpportunityMatcher user={user} />} />
                <Route path="/accounts" element={<Accounts user={user} />} />
                <Route path="/orders" element={<CustomerOrders user={user} />} />
                <Route path="/contacts" element={<Contacts user={user} />} />
                <Route path="/settings" element={<SettingsComponent user={user} onRefreshUser={() => setUser({...user})} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppLayout>
      )}
    </Router>
  );
};

export default App;
