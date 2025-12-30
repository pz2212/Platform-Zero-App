
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Users, TrendingUp, DollarSign, Award, ArrowRight, 
  BarChart, PieChart, Activity, UserPlus, ChevronDown 
} from 'lucide-react';

export const AdminRepManagement: React.FC = () => {
  const [reps, setReps] = useState<User[]>([]);
  const [repStats, setRepStats] = useState<Record<string, any>>({});

  useEffect(() => {
    const allReps = mockService.getPzRepresentatives();
    setReps(allReps);

    // Calculate stats for each rep
    const stats: Record<string, any> = {};
    allReps.forEach(rep => {
        stats[rep.id] = mockService.getRepStats(rep.id);
    });
    setRepStats(stats);
  }, []);

  const totalCommissions = Object.values(repStats).reduce((sum, s: any) => sum + s.commissionMade, 0);
  const totalSales = Object.values(repStats).reduce((sum, s: any) => sum + s.totalSales, 0);
  const activeLeads = Object.values(repStats).reduce((sum, s: any) => sum + s.customerCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Representatives</h1>
        <p className="text-gray-500">Manage performance, commissions, and lead assignments.</p>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Sales</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">${totalSales.toLocaleString()}</div>
            <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                <TrendingUp size={12}/> +12.5% this month
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Commissions Paid</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">${totalCommissions.toLocaleString()}</div>
            <div className="text-xs text-gray-400 font-medium">
                Payouts processed weekly
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Reps</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{reps.length}</div>
            <div className="text-xs text-indigo-600 font-medium">
                Full coverage across 3 regions
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Leads</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{activeLeads}</div>
            <div className="text-xs text-gray-400 font-medium">
                Customer accounts managed
            </div>
        </div>
      </div>

      {/* Rep Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <Award size={20} className="text-yellow-500"/> Performance Leaderboard
              </h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  Download Report <ArrowRight size={14}/>
              </button>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-white text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                      <tr>
                          <th className="px-6 py-4">Representative</th>
                          <th className="px-6 py-4">Active Leads</th>
                          <th className="px-6 py-4 text-right">Total Sales</th>
                          <th className="px-6 py-4 text-right">Commission Rate</th>
                          <th className="px-6 py-4 text-right">Earned (YTD)</th>
                          <th className="px-6 py-4 text-center">Health</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {reps.map(rep => {
                          const stats = repStats[rep.id] || { customerCount: 0, totalSales: 0, commissionMade: 0 };
                          return (
                              <tr key={rep.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                              {rep.name.charAt(0)}
                                          </div>
                                          <div>
                                              <div className="font-bold text-gray-900">{rep.name}</div>
                                              <div className="text-xs text-gray-500">{rep.email}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className="font-bold text-gray-700">{stats.customerCount}</span> Customers
                                  </td>
                                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                                      ${stats.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                          {rep.commissionRate}%
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                      ${stats.commissionMade.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                          <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                              <div className="h-full bg-emerald-500" style={{width: '85%'}}></div>
                                          </div>
                                          <span className="text-xs text-gray-500 ml-1">85%</span>
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Target Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600"/> Monthly Targets
              </h3>
              <div className="space-y-6">
                  <div>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">Team Sales Goal</span>
                          <span className="font-bold text-gray-900">$200k / $250k</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{width: '80%'}}></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">New Customer Acquisition</span>
                          <span className="font-bold text-gray-900">12 / 20</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{width: '60%'}}></div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="font-bold text-lg mb-1">Invite New Rep</h3>
                      <p className="text-slate-400 text-sm mb-6">Expand your sales force.</p>
                  </div>
                  <div className="p-2 bg-slate-700 rounded-lg">
                      <UserPlus size={24}/>
                  </div>
              </div>
              <div className="space-y-3">
                  <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-colors">
                      Send Invitation
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};
