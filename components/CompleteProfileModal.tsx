
import React, { useState } from 'react';
import { X, Building2, Truck, Users2, CreditCard, BookOpen, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { mockService } from '../services/mockDataService';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onComplete: () => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ isOpen, onClose, user, onComplete }) => {
  const [formData, setFormData] = useState({
    abn: user.businessProfile?.abn || '',
    address: user.businessProfile?.businessLocation || '',
    productsList: '',
    deliveryDays: [] as string[],
    deliveryWindow: '',
    instructions: '',
    chefName: '',
    chefMobile: '',
    accountsEmail: user.businessProfile?.accountsEmail || '',
    accept7DayTerms: false,
    want55DayTerms: false
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryDays: prev.deliveryDays.includes(day)
        ? prev.deliveryDays.filter(d => d !== day)
        : [...prev.deliveryDays, day]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accept7DayTerms) {
      alert("Please agree to the 7-Day Payment Terms to proceed.");
      return;
    }
    
    mockService.updateBusinessProfile(user.id, {
      ...user.businessProfile,
      abn: formData.abn,
      businessLocation: formData.address,
      accountsEmail: formData.accountsEmail,
      isComplete: true,
    } as any);

    alert("Application submitted successfully!");
    onComplete();
    onClose();
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] my-8 relative animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Complete Business Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
          
          {/* BUSINESS DETAILS */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#0E946A]">
              <Building2 size={18} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">BUSINESS DETAILS</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                name="abn" 
                placeholder="ABN / Tax ID" 
                className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none transition-all placeholder-gray-400" 
                value={formData.abn} 
                onChange={handleInputChange} 
              />
              <input 
                name="address" 
                placeholder="Full Delivery Address" 
                className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none transition-all placeholder-gray-400" 
                value={formData.address} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          {/* OPERATIONS */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#0E946A]">
              <Truck size={18} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">OPERATIONS</h3>
            </div>
            <textarea 
              name="productsList" 
              placeholder="List your most commonly ordered products (e.g. Tomatoes, Milk, Eggs...)" 
              className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none h-24 resize-none placeholder-gray-400 leading-relaxed" 
              value={formData.productsList} 
              onChange={handleInputChange} 
            />
            
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-500">Delivery Days</p>
              <div className="flex flex-wrap gap-2">
                {days.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      formData.deliveryDays.includes(day)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#F1F5F9] border-transparent text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select 
                  name="deliveryWindow"
                  value={formData.deliveryWindow}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none text-gray-500 appearance-none pr-10 font-medium"
                >
                  <option value="">Preferred Delivery Window</option>
                  <option value="6am-9am">6:00 AM - 9:00 AM</option>
                  <option value="9am-12pm">9:00 AM - 12:00 PM</option>
                  <option value="12pm-3pm">12:00 PM - 3:00 PM</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
              <input 
                name="instructions" 
                placeholder="Gate code / Instructions" 
                className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none transition-all placeholder-gray-400" 
                value={formData.instructions} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          {/* KEY CONTACTS */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#0E946A]">
              <Users2 size={18} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">KEY CONTACTS</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                name="chefName" 
                placeholder="Head Chef Name" 
                className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none transition-all placeholder-gray-400" 
                value={formData.chefName} 
                onChange={handleInputChange} 
              />
              <input 
                name="chefMobile" 
                placeholder="Chef Mobile" 
                className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none transition-all placeholder-gray-400" 
                value={formData.chefMobile} 
                onChange={handleInputChange} 
              />
            </div>
            <input 
              name="accountsEmail" 
              placeholder="Accounts Email (Invoices)" 
              className="w-full p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#0E946A] outline-none transition-all placeholder-gray-400" 
              value={formData.accountsEmail} 
              onChange={handleInputChange} 
            />
          </div>

          {/* TERMS & CONDITIONS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-[#0E946A]">
              <CreditCard size={18} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">TERMS & CONDITIONS</h3>
            </div>
            
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3.5 bg-[#F8FAFC] rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  name="accept7DayTerms" 
                  className="w-4 h-4 rounded border-gray-300 text-[#0E946A] focus:ring-[#0E946A]" 
                  checked={formData.accept7DayTerms} 
                  onChange={(e) => setFormData({...formData, accept7DayTerms: e.target.checked})} 
                />
                <span className="text-xs text-gray-600 font-medium">I agree to <strong className="text-gray-900 font-bold">7-Day Payment Terms</strong> via Direct Debit.</span>
              </label>

              <label className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${formData.want55DayTerms ? 'bg-[#EEF6FF] border-[#BFDBFE]' : 'bg-[#EEF6FF] border-transparent'}`}>
                <input 
                  type="checkbox" 
                  name="want55DayTerms" 
                  className="mt-1 w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500" 
                  checked={formData.want55DayTerms} 
                  onChange={(e) => setFormData({...formData, want55DayTerms: e.target.checked})} 
                />
                <div className="flex-1">
                  <span className="text-xs text-gray-900 font-bold block">Request 55-Day Terms?</span>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Pay later with our American Express partnership. (Subject to approval)</p>
                </div>
              </label>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1.5">
                <BookOpen size={16}/> Read Terms & Conditions
              </button>
              <div className="text-sm font-bold">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="text-red-500 ml-2">Pending</span>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#0E946A] hover:bg-[#0c825d] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mt-2 active:scale-[0.98]"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};
