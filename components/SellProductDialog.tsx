
import React, { useState, useEffect } from 'react';
import { Product, Customer, LogisticsDetails, Driver } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { X, Truck, Hand, Calendar, Clock, MapPin, User as UserIcon, Plus, Smartphone, CheckCircle, DollarSign, CreditCard, FileText, Send } from 'lucide-react';

interface SellProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onComplete: (data: any) => void;
}

export const SellProductDialog: React.FC<SellProductDialogProps> = ({ isOpen, onClose, product, onComplete }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerKg, setPricePerKg] = useState<number>(product.defaultPricePerKg);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
      businessName: '',
      contactName: '',
      mobile: '',
      email: ''
  });
  const [logisticsMethod, setLogisticsMethod] = useState<'PICKUP' | 'LOGISTICS'>('PICKUP');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('invoice');

  useEffect(() => {
    setCustomers(mockService.getCustomers());
  }, []);

  if (!isOpen) return null;

  const totalAmount = (quantity * pricePerKg).toFixed(2);

  const handleSubmit = (action: 'QUOTE' | 'SALE') => {
    const targetMobile = isNewCustomer ? newCustomer.mobile : customers.find(c => c.id === selectedCustomerId)?.phone;

    if (!isNewCustomer && !selectedCustomerId) {
        alert("Please select a customer.");
        return;
    }
    if (isNewCustomer && (!newCustomer.businessName || !newCustomer.mobile)) {
        alert("Please enter Business Name and Mobile for the new customer.");
        return;
    }

    const saleData = {
        product,
        quantity,
        pricePerKg,
        customer: isNewCustomer ? { ...newCustomer, isNew: true } : { id: selectedCustomerId, isNew: false },
        logistics: {
            method: logisticsMethod,
            deliveryDate,
            deliveryTime,
            deliveryLocation: logisticsMethod === 'LOGISTICS' ? deliveryAddress : 'Pickup from Warehouse'
        },
        paymentMethod,
        action
    };

    if (action === 'QUOTE' && targetMobile) {
        const link = generateProductDeepLink('quote', Math.random().toString(36).substr(2, 9));
        const msg = `PZ QUOTE: ${product.name} (${quantity}kg) available for $${pricePerKg}/kg. Total: $${totalAmount}. Click to accept & confirm delivery: ${link}`;
        triggerNativeSms(targetMobile, msg);
    }

    onComplete(saleData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Make a Sale <span className="text-gray-400 font-normal">| {product.name}</span>
            </h2>
            <p className="text-sm text-gray-500">Configure order details and send to customer.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Customer</label>
                    <button 
                        onClick={() => { setIsNewCustomer(!isNewCustomer); setSelectedCustomerId(''); }}
                        className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1"
                    >
                        {isNewCustomer ? 'Select Existing' : '+ New Customer'}
                    </button>
                </div>

                {isNewCustomer ? (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3 animate-in slide-in-from-top-2">
                        <input 
                            placeholder="Business Name"
                            className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                            value={newCustomer.businessName}
                            onChange={e => setNewCustomer({...newCustomer, businessName: e.target.value})}
                            autoFocus
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                placeholder="Contact Name"
                                className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                                value={newCustomer.contactName}
                                onChange={e => setNewCustomer({...newCustomer, contactName: e.target.value})}
                            />
                            <div className="relative">
                                <Smartphone size={16} className="absolute left-3 top-3 text-emerald-600"/>
                                <input 
                                    placeholder="Mobile Number (for SMS)"
                                    className="w-full pl-9 p-2.5 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                                    value={newCustomer.mobile}
                                    onChange={e => setNewCustomer({...newCustomer, mobile: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <UserIcon size={18} className="absolute left-3 top-3 text-gray-400"/>
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none appearance-none text-gray-900"
                        >
                            <option value="">Search existing customers...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.businessName} ({c.contactName}) - {c.phone}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity (kg)</label>
                    <input 
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold text-lg text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price ($/kg)</label>
                    <input 
                        type="number"
                        step="0.10"
                        value={pricePerKg}
                        onChange={(e) => setPricePerKg(parseFloat(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold text-lg text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none"
                    />
                </div>
                <div className="bg-gray-50 rounded-lg p-2 flex flex-col justify-center items-end pr-4 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase">Total</span>
                    <span className="text-xl font-extrabold text-emerald-600">${totalAmount}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Fulfillment</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setLogisticsMethod('PICKUP')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${logisticsMethod === 'PICKUP' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Hand size={16}/> Pickup
                        </button>
                        <button 
                            onClick={() => setLogisticsMethod('LOGISTICS')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${logisticsMethod === 'LOGISTICS' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Truck size={16}/> Delivery
                        </button>
                    </div>
                    {logisticsMethod === 'LOGISTICS' && (
                        <div className="space-y-2 animate-in fade-in">
                            <input 
                                placeholder="Delivery Address"
                                value={deliveryAddress}
                                onChange={e => setDeliveryAddress(e.target.value)}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900"/>
                                <input type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900"/>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Payment</label>
                    <div className="grid grid-cols-1 gap-2">
                        <button 
                            onClick={() => setPaymentMethod('invoice')}
                            className={`px-4 py-2.5 rounded-lg border text-left text-sm font-medium flex items-center gap-3 transition-all ${paymentMethod === 'invoice' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'invoice' ? 'border-indigo-500' : 'border-gray-400'}`}>
                                {paymentMethod === 'invoice' && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                            </div>
                            <FileText size={16}/> Send Invoice (Terms)
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('card')}
                            className={`px-4 py-2.5 rounded-lg border text-left text-sm font-medium flex items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-indigo-500' : 'border-gray-400'}`}>
                                {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                            </div>
                            <CreditCard size={16}/> Credit Card (Now)
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto flex gap-4">
            <button 
                onClick={() => handleSubmit('SALE')}
                className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 shadow-sm flex items-center justify-center gap-2"
            >
                <CheckCircle size={18}/> Record Sale
            </button>
            <button 
                onClick={() => handleSubmit('QUOTE')}
                className="flex-[2] py-3 bg-[#043003] text-white font-bold rounded-lg hover:bg-[#064004] shadow-md flex items-center justify-center gap-2"
            >
                <Smartphone size={18}/> Send Quote via SMS
            </button>
        </div>
      </div>
    </div>
  );
};
