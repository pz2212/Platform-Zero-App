
import React, { useState, useEffect, useRef } from 'react';
import { User, Driver, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { Plus, Truck, User as UserIcon, Phone, FileText, CheckCircle, X, MapPin, ExternalLink, Calendar, Camera, Upload } from 'lucide-react';

interface DriverManagementProps {
  user: User;
}

export const DriverManagement: React.FC<DriverManagementProps> = ({ user }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Run Sheet Modal State
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [driverRunSheet, setDriverRunSheet] = useState<Order[]>([]);
  
  // Proof of Delivery State
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    vehicleRegistration: '',
    vehicleType: 'Van',
    status: 'Active'
  });

  useEffect(() => {
    setDrivers(mockService.getDrivers(user.id));
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: Driver = {
      id: `d${Date.now()}`,
      wholesalerId: user.id,
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone!,
      licenseNumber: formData.licenseNumber!,
      vehicleRegistration: formData.vehicleRegistration!,
      vehicleType: formData.vehicleType as any,
      status: 'Active'
    };
    mockService.addDriver(newDriver);
    setDrivers(mockService.getDrivers(user.id));
    setIsAddModalOpen(false);
    setFormData({
       name: '', email: '', phone: '', licenseNumber: '', vehicleRegistration: '', vehicleType: 'Van'
    });
  };

  const handleViewOrders = (driver: Driver) => {
      const orders = mockService.getDriverOrders(driver.id);
      setDriverRunSheet(orders);
      setViewingDriver(driver);
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
      if (deliveringOrderId && viewingDriver) {
          // Use default mock image if none uploaded for demo speed
          const finalPhoto = proofPhoto || 'https://images.unsplash.com/photo-1629896263657-3f3333333333?auto=format&fit=crop&q=80&w=300';
          
          mockService.deliverOrder(deliveringOrderId, viewingDriver.name, finalPhoto);
          
          alert("Delivery Confirmed! The buyer has been notified to verify their order within 1 hour.");
          
          // Refresh list
          const updatedOrders = mockService.getDriverOrders(viewingDriver.id);
          setDriverRunSheet(updatedOrders);
          
          // Reset state
          setDeliveringOrderId(null);
          setProofPhoto(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
           <p className="text-gray-500">Manage your fleet, assign licenses, and track driver availability.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm font-medium"
        >
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map(driver => {
          const activeOrdersCount = mockService.getDriverOrders(driver.id).length;
          return (
            <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {driver.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900">{driver.name}</h3>
                      <p className="text-xs text-gray-500">{driver.email}</p>
                   </div>
                 </div>
                 <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${driver.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                   {driver.status}
                 </span>
              </div>
              <div className="p-5 space-y-3">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-500 flex items-center gap-2"><Phone size={14}/> Phone</span>
                   <span className="font-medium text-gray-900">{driver.phone}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-500 flex items-center gap-2"><FileText size={14}/> License</span>
                   <span className="font-medium text-gray-900 font-mono">{driver.licenseNumber}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-500 flex items-center gap-2"><Truck size={14}/> Vehicle</span>
                   <span className="font-medium text-gray-900 text-right">{driver.vehicleType}<br/><span className="text-xs text-gray-400">{driver.vehicleRegistration}</span></span>
                 </div>
                 <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                   <span className="text-gray-500 flex items-center gap-2"><Truck size={14}/> Active Run</span>
                   <span className={`font-bold ${activeOrdersCount > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {activeOrdersCount} Deliveries
                   </span>
                 </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                 <button className="flex-1 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100">
                    Edit Details
                 </button>
                 <button 
                    onClick={() => handleViewOrders(driver)}
                    className="flex-1 py-1.5 text-xs font-bold bg-indigo-600 text-white border border-indigo-600 rounded hover:bg-indigo-700 flex items-center justify-center gap-1 shadow-sm"
                 >
                    <ExternalLink size={12}/> View Run Sheet
                 </button>
              </div>
            </div>
          );
        })}
        {drivers.length === 0 && (
           <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <Truck size={48} className="mx-auto text-gray-300 mb-4"/>
              <h3 className="text-lg font-medium text-gray-900">No drivers added yet</h3>
              <p className="text-gray-500 mt-1">Start building your fleet to assign internal deliveries.</p>
           </div>
        )}
      </div>

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-900">Add New Driver</h2>
               <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20}/>
               </button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                 <input 
                    required type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        required type="email" 
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                        required type="tel" 
                        className="w-full border border-gray-300 rounded-md p-2"
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                 </div>
               </div>
               
               <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Vehicle & License Info</h3>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License Number</label>
                        <input 
                            required type="text" 
                            className="w-full border border-gray-300 rounded-md p-2"
                            value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                            <select 
                                className="w-full border border-gray-300 rounded-md p-2"
                                value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value as any})}
                            >
                                <option>Van</option>
                                <option>Truck</option>
                                <option>Refrigerated Truck</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rego Number</label>
                            <input 
                                required type="text" 
                                className="w-full border border-gray-300 rounded-md p-2 uppercase"
                                value={formData.vehicleRegistration} onChange={e => setFormData({...formData, vehicleRegistration: e.target.value})}
                            />
                        </div>
                    </div>
                  </div>
               </div>

               <div className="pt-6 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setIsAddModalOpen(false)}
                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                 >
                    Cancel
                 </button>
                 <button 
                   type="submit"
                   className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                 >
                    Save Driver
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Driver Run Sheet Modal */}
      {viewingDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              <Truck size={24} className="text-indigo-600"/> Run Sheet: {viewingDriver.name}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">Simulating view of Driver Portal App</p>
                      </div>
                      <button onClick={() => setViewingDriver(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
                      {deliveringOrderId ? (
                          // PROOF OF DELIVERY VIEW
                          <div className="space-y-6">
                              <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-bold text-gray-900">Proof of Delivery</h3>
                                  <button onClick={() => { setDeliveringOrderId(null); setProofPhoto(null); }} className="text-sm text-gray-500 hover:text-gray-900">Cancel</button>
                              </div>
                              
                              <p className="text-sm text-gray-600">Please take a photo of the delivered goods to complete this order.</p>
                              
                              <div 
                                  className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                                      proofPhoto ? 'border-emerald-500' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                  }`}
                                  onClick={() => fileInputRef.current?.click()}
                              >
                                  {proofPhoto ? (
                                      <img src={proofPhoto} alt="Proof" className="w-full h-full object-cover"/>
                                  ) : (
                                      <div className="text-center p-6">
                                          <div className="bg-indigo-50 p-4 rounded-full inline-flex mb-3">
                                              <Camera size={32} className="text-indigo-600"/>
                                          </div>
                                          <p className="font-medium text-gray-900">Tap to Take Photo</p>
                                      </div>
                                  )}
                                  <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      ref={fileInputRef}
                                      onChange={handlePhotoUpload}
                                  />
                              </div>

                              <button 
                                  onClick={submitDelivery}
                                  disabled={!proofPhoto}
                                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                  <CheckCircle size={20}/> Submit & Complete Delivery
                              </button>
                          </div>
                      ) : (
                          // LIST VIEW
                          <>
                              {driverRunSheet.length === 0 ? (
                                  <div className="text-center py-12 text-gray-400">
                                      <CheckCircle size={48} className="mx-auto mb-2 text-gray-300"/>
                                      <p>No active deliveries assigned.</p>
                                  </div>
                              ) : (
                                  <div className="space-y-4">
                                      {driverRunSheet.map((order, index) => (
                                          <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
                                              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                                  <span className="text-xs font-bold text-gray-500 uppercase">Stop #{index + 1}</span>
                                                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                      {order.logistics?.deliveryTime || 'TBD'}
                                                  </span>
                                              </div>
                                              <div className="p-4">
                                                  <h3 className="font-bold text-gray-900 text-lg">{mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName}</h3>
                                                  <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                                                      <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400"/>
                                                      <span>{order.logistics?.deliveryLocation}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                                      <Calendar size={16} className="text-gray-400"/>
                                                      <span>{order.items.length} Packages</span>
                                                  </div>
                                                  
                                                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                                                      <button className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 text-sm">
                                                          Navigation
                                                      </button>
                                                      <button 
                                                          onClick={() => setDeliveringOrderId(order.id)}
                                                          className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-sm"
                                                      >
                                                          Complete Delivery
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
