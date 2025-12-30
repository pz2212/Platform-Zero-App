
import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { ArrowDownLeft, ArrowUpRight, FileText, Download, Filter, Search, DollarSign } from 'lucide-react';

interface AccountsProps {
  user: User;
}

export const Accounts: React.FC<AccountsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
  const [receivables, setReceivables] = useState<Order[]>([]);
  const [payables, setPayables] = useState<Order[]>([]);

  useEffect(() => {
    // Receivables: Money owed TO me (I am the Seller)
    const rec = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setReceivables(rec);

    // Payables: Money I owe (I am the Buyer)
    const pay = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
    setPayables(pay);
  }, [user]);

  const getCounterpartyName = (order: Order, type: 'receivables' | 'payables') => {
      if (type === 'receivables') {
          return mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName || 'Unknown Buyer';
      } else {
          // Find seller (could be another wholesaler or farmer)
          const seller = mockService.getAllUsers().find(u => u.id === order.sellerId);
          return seller ? seller.businessName : 'Unknown Supplier';
      }
  };

  const getTotalAmount = (orders: Order[]) => {
      return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Paid': return 'bg-green-100 text-green-700';
          case 'Unpaid': return 'bg-yellow-100 text-yellow-700';
          case 'Overdue': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  const handleDownloadInvoice = (order: Order) => {
      const counterparty = getCounterpartyName(order, activeTab);
      const invoiceData = `
PLATFORM ZERO - INVOICE #${order.id.split('-')[1] || order.id}
------------------------------------------------
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.paymentStatus || order.status}

${activeTab === 'receivables' ? 'BILL TO:' : 'FROM:'}
${counterparty}

AMOUNT: $${order.totalAmount.toFixed(2)}
------------------------------------------------
Items:
${order.items.map(i => `- ${i.productId}: ${i.quantityKg}kg @ $${i.pricePerKg}/kg`).join('\n')}

------------------------------------------------
Thank you for using Platform Zero.
      `;

      const blob = new Blob([invoiceData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${order.id}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
      const data = (activeTab === 'receivables' ? receivables : payables).map(o => {
          return `${new Date(o.date).toLocaleDateString()},${o.id},${getCounterpartyName(o, activeTab)},${o.totalAmount},${o.paymentStatus}`;
      }).join('\n');
      
      const header = "Date,InvoiceID,Counterparty,Amount,Status\n";
      const blob = new Blob([header + data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const currentList = activeTab === 'receivables' ? receivables : payables;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-500">Track invoices, payments, and financial health.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleExportReport}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
                <Download size={16}/> Export Report
            </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                          <ArrowDownLeft size={24} />
                      </div>
                      <span className="text-gray-500 font-medium">Receivables (Money In)</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">Total Outstanding</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">${getTotalAmount(receivables).toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">{receivables.length} invoices issued</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                          <ArrowUpRight size={24} />
                      </div>
                      <span className="text-gray-500 font-medium">Payables (Money Out)</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">Total Due</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">${getTotalAmount(payables).toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">{payables.length} bills to pay</p>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
                <button
                    onClick={() => setActiveTab('receivables')}
                    className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'receivables'
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Receivables
                </button>
                <button
                    onClick={() => setActiveTab('payables')}
                    className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'payables'
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Payables
                </button>
            </nav>
          </div>

          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                  <input 
                    type="text" 
                    placeholder="Search invoice # or business..." 
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
              </div>
              <div className="flex gap-2">
                  <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                      <Filter size={16}/> Filter
                  </button>
              </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                      <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Invoice #</th>
                          <th className="px-6 py-4">{activeTab === 'receivables' ? 'Customer' : 'Supplier'}</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Due Date</th>
                          <th className="px-6 py-4">Payment Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {currentList.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 font-mono text-sm text-gray-900">INV-{order.id.split('-')[1] || order.id}</td>
                              <td className="px-6 py-4 font-medium text-gray-900">{getCounterpartyName(order, activeTab)}</td>
                              <td className="px-6 py-4 font-bold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                  {new Date(new Date(order.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusColor(order.issue ? 'Disputed' : (order.paymentStatus || 'Unpaid'))}`}>
                                      {order.issue ? 'Disputed' : (order.paymentStatus || 'Unpaid')}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => handleDownloadInvoice(order)}
                                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-end gap-1 ml-auto"
                                  >
                                      <FileText size={14}/> View
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {currentList.length === 0 && (
                          <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                  No {activeTab} found for this period.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
