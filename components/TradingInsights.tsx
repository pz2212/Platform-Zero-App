
import React, { useState, useEffect } from 'react';
import { User, InventoryItem, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { getMarketAnalysis } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Sparkles, RefreshCcw } from 'lucide-react';

interface TradingInsightsProps {
  user: User;
}

export const TradingInsights: React.FC<TradingInsightsProps> = ({ user }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    setInventory(mockService.getInventory(user.id));
  }, [user]);

  const handleRunAnalysis = async () => {
    setLoadingAi(true);
    const analysis = await getMarketAnalysis(inventory, mockService.getAllProducts());
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 6890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-[500px] flex flex-col">
          <h3 className="text-xl font-bold text-[#1E293B] mb-8">Weekly Sales Performance</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 14 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 14 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="sales" fill="#10B981" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-500" /> Market Intelligence
            </h3>
            <button 
              onClick={handleRunAnalysis} 
              disabled={loadingAi}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loadingAi ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
              {loadingAi ? 'Analyzing...' : 'Refresh Analysis'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {aiAnalysis ? (
               <div className="prose prose-sm prose-indigo text-gray-700 leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                    <Sparkles size={32} />
                </div>
                <div className="max-w-[200px]">
                    <p className="text-gray-400 text-sm">Click "Refresh Analysis" to get real-time market insights powered by Gemini 2.5.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
