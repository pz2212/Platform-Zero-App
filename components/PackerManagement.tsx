
import React, { useState, useEffect } from 'react';
import { User, Packer, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { Plus, User as UserIcon, Phone, Mail, Link, X, Box, CheckCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';

interface PackerManagementProps {
  user: User;
}

export const PackerManagement: React.FC<PackerManagementProps> = ({ user }) => {
  const [packers, setPackers] = useState<Packer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // View Tasks Modal State
  const [viewingPacker, setViewingPacker] = useState<Packer | null>(null);
  const [activeTasks, setActiveTasks] = useState<Order[]>([]);
  const [packingOrderId, setPackingOrderId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Packer>>({
    name: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  useEffect(() => {
    setPackers(mockService.getPackers(user.id));
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPacker: Packer = {
      id: `pk${Date.now()}`,
      wholesalerId: user.id,
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone!,
      status: 'Active'
    };
    mockService.addPacker(newPacker);
    setPackers(mockService.getPackers(user.id));
    setIsAddModalOpen(false);
    setFormData({
       name: '', email: '', phone: ''
    });
  };

  const handleSendLink = (packer: Packer) => {
      const link = `https://portal.platformzero.com/packer/${packer.id}`;
      alert(`Portal Link sent to ${packer.name} via SMS (${packer.phone}):\n\n"${link}"`);
  };

  const handleViewTasks = (packer: Packer) => {
      const tasks = mockService.getPackerOrders(packer.id);
      setActiveTasks(tasks);
      setViewingPacker(packer);
  };

  const handleStartPacking = (order: Order) => {
      if (!viewingPacker) return;
      setPackingOrderId(order.id);
      
      // Simulate packing time
      setTimeout(() => {
          mockService.packOrder(order.id, viewingPacker.name);
          alert(`Order #${order.id.split('-')[1] || order.id} packed and marked ready for delivery! Customer has been notified.`);
          
          // Refresh list
          const updatedTasks = mockService.getPackerOrders(viewingPacker.id);
          setActiveTasks(updatedTasks);
          setPackingOrderId(null);
      }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-gray-900">Packer Management</h1>
           <p className="text-gray-500 text-sm">Manage staff who prepare and pack orders.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm font-medium text-sm"
        >
          <Plus size={16} />
          Add Packer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packers.map(packer => {
          const taskCount = mockService.getPackerOrders(packer.id).length;
          return (
            <div key={packer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                      {packer.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-sm">{packer.name}</h3>
                      <p className="text-xs text-gray-500">ID: {packer.id}</p>
                   </div>
                 </div>
                 <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${packer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                   {packer.status}
                 </span>
              </div>
              <div className="p-5 space-y-3">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-500 flex items-center gap-2"><Phone size={14}/> Mobile</span>
                   <span className="font-medium text-gray-900">{packer.phone}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-500 flex items-center gap-2"><Mail size={14}/> Email</span>
                   <span className="font-medium text-gray-900 truncate max-w-[150px]">{packer.email}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                   <span className="text-gray-500 flex items-center gap-2"><Box size={14}/> Active Tasks</span>
                   <span className={`font-bold ${taskCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {taskCount} Orders
                   </span>
                 </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                 <button 
                    onClick={() => handleViewTasks(packer)}
                    className="flex-1 py-2 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 flex items-center justify-center gap-1 shadow-sm"
                 >
                    <ExternalLink size={12}/> View Portal Tasks
                 </button>
                 <button 
                    onClick={() => handleSendLink(packer)}
                    className="flex-1 py-2 text-xs font-bold bg-white border border-indigo-200 text-indigo-600 rounded hover:bg-indigo-50 flex items-center justify-center gap-1 shadow-sm"
                 >
                    <Link size={12}/> Send Link
                 </button>
              </div>
            </div>
          );
        })}
        {packers.length === 0 && (
           <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <Box size={48} className="mx-auto text-gray-300 mb-4"/>
              <h3 className="text-lg font-medium text-gray-900">No packers added yet</h3>
              <p className="text-gray-500 mt-1 text-sm">Add staff to enable packing assignments.</p>
           </div>
        )}
      </div>

      {/* Add Packer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-900">Add New Packer</h2>
               <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20}/>
               </button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                 <input 
                    required type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                 />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input 
                      required type="tel" 
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="For portal link SMS"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input 
                      type="email" 
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
               </div>
               
               <div className="pt-6 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setIsAddModalOpen(false)}
                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-bold"
                 >
                    Cancel
                 </button>
                 <button 
                   type="submit"
                   className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm"
                 >
                    Save Packer
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* View Tasks Modal */}
      {viewingPacker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              <Box size={24} className="text-orange-600"/> {viewingPacker.name}'s Active Queue
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">Simulating view of Packer Portal App</p>
                      </div>
                      <button onClick={() => setViewingPacker(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
                      {activeTasks.length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                              <CheckCircle size={48} className="mx-auto mb-2 text-gray-300"/>
                              <p>No active packing tasks assigned.</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {activeTasks.map(order => (
                                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                                      <div className="flex justify-between items-start mb-2">
                                          <div>
                                              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded uppercase">To Pack</span>
                                              <h3 className="font-bold text-gray-900 text-lg mt-1">Order #{order.id.split('-')[1] || order.id}</h3>
                                              <p className="text-sm text-gray-600">{mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName}</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Time Remaining</p>
                                              <p className="text-emerald-600 font-bold flex items-center justify-end gap-1"><Clock size={14}/> 45m</p>
                                          </div>
                                      </div>
                                      
                                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                          {order.items.map((item, idx) => (
                                              <div key={idx} className="flex justify-between text-sm">
                                                  <span className="text-gray-700">{mockService.getProduct(item.productId)?.name}</span>
                                                  <span className="font-bold">{item.quantityKg} kg</span>
                                              </div>
                                          ))}
                                      </div>

                                      <div className="mt-4 pt-3 border-t border-gray-100">
                                          <button 
                                            onClick={() => handleStartPacking(order)}
                                            disabled={packingOrderId === order.id}
                                            className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-sm flex items-center justify-center gap-2 transition-all"
                                          >
                                              {packingOrderId === order.id ? (
                                                  <><Loader2 size={16} className="animate-spin"/> Packing...</>
                                              ) : (
                                                  'Start Packing & Confirm'
                                              )}
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
