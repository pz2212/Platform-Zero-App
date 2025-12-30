
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationRequest, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { Check, X, Clock, UserCheck, UserX, Info, ShoppingBag, FileText, Calculator, UserPlus, Link as LinkIcon, Copy, Building, User, Mail, Smartphone, MapPin, ChevronRight, CheckCircle, Trash2, Send } from 'lucide-react';

const ManualInviteModal = ({ isOpen, onClose, onInvite }: { isOpen: boolean, onClose: () => void, onInvite: (data: any) => void }) => {
    const [formData, setFormData] = useState({
        businessName: '',
        name: '',
        email: '',
        mobile: '',
        role: UserRole.WHOLESALER as UserRole,
        location: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Manual Business Invite</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Invitation Type</label>
                        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                            <button type="button" onClick={() => setFormData({...formData, role: UserRole.WHOLESALER})} className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all ${formData.role === UserRole.WHOLESALER ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Wholesaler / Farmer</button>
                            <button type="button" onClick={() => setFormData({...formData, role: UserRole.CONSUMER})} className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all ${formData.role === UserRole.CONSUMER ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Buyer / Customer</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative"><Building className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required placeholder="Business Trading Name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} /></div>
                        <div className="relative"><User className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required placeholder="Key Contact Name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required type="email" placeholder="Email Address" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                            <div className="relative"><Smartphone className="absolute left-3 top-3.5 text-slate-400" size={18}/><input placeholder="Mobile (Optional)" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
                        </div>
                        <div className="relative"><MapPin className="absolute left-3 top-3.5 text-slate-400" size={18}/><input placeholder="Location / Region" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#043003] outline-none text-sm font-black text-slate-900 placeholder-slate-400" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-[#043003] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">Generate Invite Link</button>
                </form>
            </div>
        </div>
    );
};

const SuccessInviteModal = ({ invite, onClose }: { invite: RegistrationRequest, onClose: () => void }) => {
    const link = generateProductDeepLink('portal', invite.id.split('-')[1] || invite.id);
    
    const copyLink = () => {
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    };

    const sendViaSms = () => {
        if (!invite.consumerData?.mobile) {
            alert("No mobile number available for this invite.");
            return;
        }
        const msg = `Welcome to Platform Zero! Set up your ${invite.requestedRole} portal here: ${link}`;
        triggerNativeSms(invite.consumerData.mobile, msg);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"><LinkIcon size={40} /></div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Invite Generated!</h2>
                <p className="text-gray-500 mb-8">Share this unique setup link with <span className="font-bold text-gray-900">{invite.businessName}</span>.</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-3"><input readOnly value={link} className="bg-transparent flex-1 text-xs font-mono text-gray-900 font-bold outline-none" /><button onClick={copyLink} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"><Copy size={18}/></button></div>
                <button onClick={sendViaSms} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mb-2"><Smartphone size={18}/> Send via SMS App</button>
                <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Back to Dashboard</button>
            </div>
        </div>
    );
};

export const LoginRequests: React.FC = () => {
    const [requests, setRequests] = useState<RegistrationRequest[]>([]);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [successInvite, setSuccessInvite] = useState<RegistrationRequest | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setRequests(mockService.getRegistrationRequests());
    }, []);

    const handleApprove = (id: string) => {
        mockService.approveRegistration(id);
        setRequests(mockService.getRegistrationRequests());
    };

    const handleReject = (id: string) => {
        mockService.rejectRegistration(id);
        setRequests(mockService.getRegistrationRequests());
    };

    const handleGenerateQuote = (req: RegistrationRequest) => {
        // Navigate to quote generator with pre-filled state
        navigate('/pricing-requests', { 
            state: { 
                customerName: req.businessName,
                customerLocation: req.consumerData?.location || '',
                invoiceFile: req.consumerData?.invoiceFile || null,
                weeklySpend: req.consumerData?.weeklySpend || 0,
                orderFreq: req.consumerData?.orderFrequency || 'Weekly'
            } 
        });
    };

    const handleManualInvite = (data: any) => {
        const invite = mockService.createManualInvite(data);
        setRequests(mockService.getRegistrationRequests());
        setIsManualModalOpen(false);
        setSuccessInvite(invite);
    };

    const handleDelete = (id: string) => {
        if(confirm("Permanently delete this request?")) {
            mockService.deleteRegistrationRequest(id);
            setRequests(mockService.getRegistrationRequests());
        }
    }

    const pending = requests.filter(r => r.status === 'Pending');

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Login Requests</h1>
                    <p className="text-gray-500 font-medium">Review and approve new business access requests.</p>
                </div>
                <button 
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-6 py-3 bg-[#043003] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <UserPlus size={18}/> Manual Invite
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <Clock size={24} className="text-orange-500"/> Pending Review
                    </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {pending.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">
                            <CheckCircle size={48} className="mx-auto mb-4 opacity-20"/>
                            <p className="font-bold uppercase tracking-widest text-xs">No pending requests</p>
                        </div>
                    ) : (
                        pending.map(req => (
                            <div key={req.id} className="p-8 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${req.requestedRole === UserRole.CONSUMER ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {req.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">{req.businessName}</h3>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{req.requestedRole} Request</p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-bold uppercase">
                                            <span className="flex items-center gap-1.5"><User size={14}/> {req.name}</span>
                                            <span className="flex items-center gap-1.5"><Mail size={14}/> {req.email}</span>
                                            {req.consumerData?.location && <span className="flex items-center gap-1.5"><MapPin size={14}/> {req.consumerData.location}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleDelete(req.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                                    
                                    {/* Action: Quote Generator Transition */}
                                    <button 
                                        onClick={() => handleGenerateQuote(req)} 
                                        className="px-6 py-3 bg-white border border-gray-200 text-indigo-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center gap-2"
                                    >
                                        <Calculator size={16}/> Generate Quote
                                    </button>

                                    <button onClick={() => handleReject(req.id)} className="px-6 py-3 bg-white border border-gray-200 text-gray-500 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">Reject</button>
                                    
                                    <button onClick={() => handleApprove(req.id)} className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2">
                                        <Check size={16}/> Approve Access
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ManualInviteModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} onInvite={handleManualInvite} />
            {successInvite && <SuccessInviteModal invite={successInvite} onClose={() => setSuccessInvite(null)} />}
        </div>
    );
};
