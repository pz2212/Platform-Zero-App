
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplierPriceRequest, User, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Handshake, Store, CheckCircle, ChevronRight, X, MessageSquare, 
  Clock, AlertCircle, Rocket, MapPin, DollarSign, ArrowLeft
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

export const AdminPriceRequests: React.FC = () => {
  const [activeRequests, setActiveRequests] = useState<SupplierPriceRequest[]>([]);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [viewingRequest, setViewingRequest] = useState<SupplierPriceRequest | null>(null);
  const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<Customer | null>(null);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSupplierName, setChatSupplierName] = useState('');
  const [chatQuoteContext, setChatQuoteContext] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const allRequests = mockService.getAllSupplierPriceRequests();
    setActiveRequests(allRequests);
    setWholesalers(mockService.getWholesalers());
  };

  const handleOpenSupplierChat = (req: SupplierPriceRequest) => {
    const supplier = wholesalers.find(w => w.id === req.supplierId);
    setChatSupplierName(supplier?.businessName || 'Supplier');
    setChatQuoteContext(`Quote ID: #${req.id.split('-').pop()}. Lead: ${req.customerContext}. Proposed items: ${req.items.map(i => i.productName).join(', ')}.`);
    setIsChatOpen(true);
  };

  const handleDealWon = (reqId: string) => {
    const newCustomer = mockService.finalizeDeal(reqId);
    refreshData();
    setViewingRequest(null);
    if (newCustomer) {
      setNewlyCreatedCustomer(newCustomer);
    }
  };

  const handleGetStarted = (customerId: string) => {
    mockService.sendOnboardingComms(customerId);
    alert("Onboarding Link dispatched via SMS and Email to the customer!");
    setNewlyCreatedCustomer(null);
    navigate('/consumer-onboarding');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'SUBMITTED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'WON': return 'bg-green-50 text-green-700 border-green-100';
      case 'LOST': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Price Requests</h1>
          <p className="text-gray-500 font-medium mt-1">Review active negotiations and finalize quotes from wholesalers.</p>
        </div>
      </div>

      {newlyCreatedCustomer && (
        <div className="bg-[#043003] text-white p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-emerald-500/30">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500/20 p-4 rounded-3xl">
              <Rocket size={32} className="text-emerald-400"/>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Lead Won: {newlyCreatedCustomer.businessName}</h2>
              <p className="text-emerald-400/80 font-medium text-sm">Account mapped to {newlyCreatedCustomer.connectedSupplierName}. Ready for activation.</p>
            </div>
          </div>
          <button 
            onClick={() => handleGetStarted(newlyCreatedCustomer.id)}
            className="bg-white text-[#043003] px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-emerald-50 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            Get Started
          </button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-black text-gray-900 text-xl tracking-tight uppercase flex items-center gap-3">
                <Handshake size={24} className="text-indigo-600"/> Multi-Supplier Feed
            </h3>
            <span className="text-[10px] font-black bg-white border border-gray-200 text-gray-400 px-4 py-1.5 rounded-full uppercase tracking-widest">
                {activeRequests.filter(r => r.status !== 'WON').length} Active Negotiations
            </span>
        </div>

        {activeRequests.length === 0 ? (
            <div className="p-24 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                    <Handshake size={32} className="text-gray-200" />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No active negotiations found</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-8 gap-6">
                {activeRequests.map(req => {
                    const supplier = wholesalers.find(w => w.id === req.supplierId);
                    const isNewOffer = req.status === 'SUBMITTED';

                    return (
                        <div 
                            key={req.id} 
                            onClick={() => setViewingRequest(req)}
                            className={`border-2 rounded-[2rem] p-8 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full ${
                                isNewOffer ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-50 bg-white hover:border-gray-200'
                            }`}
                        >
                            {isNewOffer && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-md animate-in slide-in-from-right-2">
                                    Offer Received
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${getStatusColor(req.status)}`}>
                                        {req.status === 'SUBMITTED' ? 'REVIEW OFFER' : req.status}
                                    </span>
                                    <p className="text-[10px] text-gray-300 font-bold font-mono">#{req.id.split('-').pop()}</p>
                                </div>
                                <h4 className="font-black text-gray-900 text-2xl leading-tight mb-2 tracking-tight">{req.customerContext}</h4>
                                <div className="space-y-1.5 mb-8">
                                    <p className="text-xs text-gray-500 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                        <Store size={14} className="text-indigo-400"/> {supplier?.businessName}
                                    </p>
                                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                        <MapPin size={14} className="text-gray-300"/> {req.customerLocation}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 group-hover:border-indigo-200">
                                <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest ${isNewOffer ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {isNewOffer ? <CheckCircle size={16}/> : <Clock size={16}/>}
                                    {isNewOffer ? 'Check Submission' : 'Waiting for Wholesaler'}
                                </div>
                                <ChevronRight size={20} className={`text-gray-300 group-hover:translate-x-1 transition-all ${isNewOffer ? 'text-indigo-500' : ''}`}/>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* VIEW QUOTE DETAILS MODAL */}
      {viewingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="p-10 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                      <div>
                          <div className="flex items-center gap-4 mb-2">
                             <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{viewingRequest.customerContext}</h2>
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 ${getStatusColor(viewingRequest.status)}`}>
                                 {viewingRequest.status}
                             </span>
                          </div>
                          <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">Submission from {wholesalers.find(w => w.id === viewingRequest.supplierId)?.businessName}</p>
                      </div>
                      <button onClick={() => setViewingRequest(null)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100"><X size={24}/></button>
                  </div>
                  
                  <div className="p-10 overflow-y-auto flex-1">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-b border-gray-100">
                                  <th className="pb-6">Product Variety</th>
                                  <th className="pb-6 text-right">Target Price</th>
                                  <th className="pb-6 text-right text-indigo-600">Offered Price</th>
                                  <th className="pb-6 text-right">Variance</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {viewingRequest.items.map((item, idx) => {
                                  const variance = item.offeredPrice ? ((item.offeredPrice - item.targetPrice) / item.targetPrice) * 100 : 0;
                                  return (
                                      <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                          <td className="py-6 font-black text-gray-900 text-lg tracking-tight">{item.productName}</td>
                                          <td className="py-6 text-right text-gray-400 font-bold">${item.targetPrice.toFixed(2)}</td>
                                          <td className="py-6 text-right font-black text-gray-900 text-xl">
                                              {item.offeredPrice ? `$${item.offeredPrice.toFixed(2)}` : <span className="text-gray-200 italic">...</span>}
                                          </td>
                                          <td className="py-6 text-right">
                                              {item.offeredPrice ? (
                                                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border-2 ${variance <= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                      {variance <= 0 ? 'Target Met' : `+${variance.toFixed(1)}%`}
                                                  </span>
                                              ) : (
                                                  <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic">Pending</span>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>

                  <div className="p-10 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-10">
                      <div className="text-left">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Combined Quote Total</p>
                          <p className="text-4xl font-black text-indigo-600 tracking-tighter">
                              ${viewingRequest.items.reduce((sum, i) => sum + (i.offeredPrice || 0), 0).toFixed(2)}
                          </p>
                      </div>
                      
                      <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            onClick={() => handleOpenSupplierChat(viewingRequest)}
                            className="flex-1 sm:flex-none px-8 py-5 bg-white border-2 border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <MessageSquare size={18}/> Chat with Wholesaler
                        </button>
                        
                        {viewingRequest.status === 'SUBMITTED' && (
                            <button 
                                onClick={() => handleDealWon(viewingRequest.id)}
                                className="flex-1 sm:flex-none px-12 py-5 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                            >
                                <CheckCircle size={20}/> Accept & Activate
                            </button>
                        )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <ChatDialog 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        orderId="QUOTE-NEGOTIATION"
        issueType={chatQuoteContext}
        repName={chatSupplierName}
      />
    </div>
  );
};
