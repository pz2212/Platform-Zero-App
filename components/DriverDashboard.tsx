
import React, { useState, useEffect, useRef } from 'react';
import { User, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { Truck, MapPin, CheckCircle, Package, Phone, Navigation, Camera, X } from 'lucide-react';

interface DriverDashboardProps {
  user: User;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Proof of Delivery State
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // In mock data, driver user id 'd1' corresponds to driver data id 'd1'
    setOrders(mockService.getDriverOrders(user.id));
  }, [user]);

  const initiateDelivery = (order: Order) => {
      setDeliveringOrder(order);
      setProofPhoto(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setProofPhoto(ev.target?.result as string);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const submitDelivery = () => {
      if (deliveringOrder) {
          const finalPhoto = proofPhoto || 'https://images.unsplash.com/photo-1629896263657-3f3333333333?auto=format&fit=crop&q=80&w=300';
          mockService.deliverOrder(deliveringOrder.id, user.name, finalPhoto);
          setOrders(mockService.getDriverOrders(user.id));
          setDeliveringOrder(null);
          setProofPhoto(null);
          alert("Delivery complete! Buyer notified.");
      }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
       <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg -mx-6 -mt-6 mb-6">
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-2xl font-bold">My Run Sheet</h1>
                <p className="text-slate-400 text-sm">Welcome back, {user.name.split(' ')[0]}</p>
             </div>
             <div className="bg-slate-800 p-2 rounded-full">
                <Truck size={24} className="text-emerald-400"/>
             </div>
          </div>
          <div className="mt-6 flex gap-4">
             <div className="bg-slate-800 rounded-xl p-3 flex-1 text-center">
                <span className="block text-2xl font-bold">{orders.length}</span>
                <span className="text-xs text-slate-400 uppercase">To Deliver</span>
             </div>
             <div className="bg-slate-800 rounded-xl p-3 flex-1 text-center">
                <span className="block text-2xl font-bold text-emerald-400">0</span>
                <span className="text-xs text-slate-400 uppercase">Completed</span>
             </div>
          </div>
       </div>

       {orders.length === 0 ? (
          <div className="text-center py-10">
             <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-gray-400"/>
             </div>
             <h3 className="text-gray-900 font-bold">All caught up!</h3>
             <p className="text-gray-500">No active deliveries assigned to you.</p>
          </div>
       ) : (
          <div className="space-y-4">
             {orders.map((order, index) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase">Stop #{index + 1}</span>
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                         {order.logistics?.deliveryTime}
                      </span>
                   </div>
                   <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                         {mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName}
                      </h3>
                      
                      <div className="flex items-start gap-3 text-gray-600 mb-4">
                         <MapPin size={18} className="mt-0.5 shrink-0 text-gray-400"/>
                         <span className="text-sm">{order.logistics?.deliveryLocation}</span>
                      </div>

                      <div className="flex gap-2 mb-4">
                         <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-gray-700">
                            <Navigation size={16}/> Map
                         </button>
                         <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-gray-700">
                            <Phone size={16}/> Call
                         </button>
                      </div>

                      <div className="border-t border-gray-100 pt-3 mb-4">
                         <div className="flex items-center gap-2 mb-2">
                            <Package size={16} className="text-gray-400"/>
                            <span className="text-sm font-semibold text-gray-700">{order.items.length} Packages</span>
                         </div>
                         <div className="text-sm text-gray-500 pl-6">
                            {order.items.map(i => (
                               <div key={i.productId} className="flex justify-between">
                                  <span>{mockService.getAllProducts().find(p => p.id === i.productId)?.name}</span>
                                  <span>{i.quantityKg}kg</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <button 
                        onClick={() => initiateDelivery(order)}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-sm hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                         <CheckCircle size={20}/> Mark Delivered
                      </button>
                   </div>
                </div>
             ))}
          </div>
       )}

       {/* PROOF OF DELIVERY MODAL */}
       {deliveringOrder && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden relative">
                   <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                       <h3 className="font-bold text-gray-900">Proof of Delivery</h3>
                       <button onClick={() => setDeliveringOrder(null)} className="p-1 text-gray-400 hover:text-gray-600">
                           <X size={24}/>
                       </button>
                   </div>
                   
                   <div className="p-6 space-y-6">
                       <div 
                           className="bg-gray-100 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50 hover:border-emerald-400 relative overflow-hidden"
                           onClick={() => fileInputRef.current?.click()}
                       >
                           {proofPhoto ? (
                               <img src={proofPhoto} alt="Proof" className="w-full h-full object-cover"/>
                           ) : (
                               <>
                                   <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                                       <Camera size={32} className="text-emerald-600"/>
                                   </div>
                                   <p className="text-sm font-bold text-gray-700">Take Photo</p>
                                   <p className="text-xs text-gray-500 mt-1">Tap to capture drop-off</p>
                               </>
                           )}
                           <input 
                               type="file" 
                               accept="image/*" 
                               className="hidden" 
                               ref={fileInputRef}
                               onChange={handlePhotoUpload}
                           />
                       </div>

                       <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                           <p className="text-xs text-emerald-800 text-center">
                               <strong>Note:</strong> Submitting this photo will notify the buyer and start their verification timer.
                           </p>
                       </div>

                       <button 
                           onClick={submitDelivery}
                           disabled={!proofPhoto}
                           className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           Submit & Finish
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
