
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DriverManagement } from './DriverManagement';
import { PackerManagement } from './PackerManagement';
import { mockService } from '../services/mockDataService';
import { CompleteProfileModal } from './CompleteProfileModal';
import { User as UserIcon, Truck, Building, Mail, Shield, Users, Plus, X, Briefcase, LayoutTemplate, RefreshCw, ToggleLeft, ToggleRight, CheckCircle, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  user: User;
  onRefreshUser?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onRefreshUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'employees' | 'partners'>('profile');
  const [teamSubTab, setTeamSubTab] = useState<'drivers' | 'packers'>('drivers');
  const [employees, setEmployees] = useState<User[]>([]);
  const [partners, setPartners] = useState<User[]>([]); // Wholesalers & Farmers
  
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<User>>({ name: '', email: '', role: UserRole.PZ_REP });

  useEffect(() => {
      if (user.role === UserRole.ADMIN) {
          setEmployees(mockService.getPzRepresentatives());
          setPartners(mockService.getAllUsers().filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
      }
  }, [user, activeTab]); // Refresh when tab changes to ensure latest state

  const handleAddEmployee = (e: React.FormEvent) => {
      e.preventDefault();
      if (newEmployee.name && newEmployee.email) {
          const newUser: User = {
              id: `emp-${Date.now()}`,
              name: newEmployee.name,
              email: newEmployee.email,
              role: UserRole.PZ_REP, // Default to rep
              businessName: 'Platform Zero'
          };
          mockService.addEmployee(newUser);
          setEmployees(mockService.getPzRepresentatives());
          setIsEmployeeModalOpen(false);
          setNewEmployee({ name: '', email: '', role: UserRole.PZ_REP });
          alert("Employee added successfully!");
      }
  };

  const handleSwitchToV1 = () => {
      if (confirm('Switch to Simplified Dashboard (Version 1)?')) {
          mockService.updateUserVersion(user.id, 'v1');
          if (onRefreshUser) onRefreshUser();
      }
  };

  const togglePartnerVersion = (partnerId: string, currentVersion: 'v1' | 'v2' | undefined) => {
      const newVersion = currentVersion === 'v2' ? 'v1' : 'v2';
      mockService.updateUserVersion(partnerId, newVersion);
      // Refresh local list
      setPartners(mockService.getAllUsers().filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
  };

  const handleProfileComplete = () => {
      // Re-fetch user details locally or trigger a refresh from parent
      if(onRefreshUser) onRefreshUser();
  };

  const isProfileComplete = user.businessProfile?.isComplete;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserIcon size={18} />
            My Profile
          </button>

          {/* Only show Team tab for Wholesalers */}
          {user.role === UserRole.WHOLESALER && (
            <button
              onClick={() => setActiveTab('team')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'team'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck size={18} />
              Team Management
            </button>
          )}

          {/* Admin Tabs */}
          {user.role === UserRole.ADMIN && (
            <>
                <button
                onClick={() => setActiveTab('partners')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'partners'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                >
                <Briefcase size={18} />
                Partner Accounts
                </button>
                <button
                onClick={() => setActiveTab('employees')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'employees'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                >
                <Users size={18} />
                Employees
                </button>
            </>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* ALERT IF PROFILE INCOMPLETE */}
            {!isProfileComplete && (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="text-red-600" size={24}/>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-red-900">Action Required: Incomplete Profile</h4>
                        <p className="text-sm text-red-700">You must complete your business onboarding documents before you can transact or receive orders.</p>
                    </div>
                    <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm whitespace-nowrap"
                    >
                        Complete Now
                    </button>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 p-8">
                {/* Profile Header */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-gray-500 font-medium uppercase tracking-wide text-sm mt-1">{user.role}</p>
                    </div>
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Business Name</label>
                        <div className="flex items-center gap-3 text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200 font-medium">
                            <Building size={20} className="text-gray-400"/>
                            {user.businessName}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Email Address</label>
                        <div className="flex items-center gap-3 text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200 font-medium">
                            <Mail size={20} className="text-gray-400"/>
                            {user.email}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-500 mb-2">Account Role</label>
                        <div className="flex items-center gap-3 text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200 font-medium w-full md:w-1/2">
                            <Shield size={20} className="text-gray-400"/>
                            {user.role}
                        </div>
                    </div>
                </div>
                
                {/* Edit Button */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* DASHBOARD VERSION TOGGLE (For Partners) */}
            {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                            <LayoutTemplate size={20}/> Dashboard Version
                        </h3>
                        <p className="text-indigo-700 text-sm mt-1">
                            You are using the advanced <strong>Version 2</strong> layout. Switch back to V1 for a simplified view.
                        </p>
                    </div>
                    <button 
                        onClick={handleSwitchToV1}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm text-sm transition-colors"
                    >
                        Switch to Simplified (v1)
                    </button>
                </div>
            )}
          </div>
        )}

        {activeTab === 'team' && user.role === UserRole.WHOLESALER && (
          <div className="space-y-6">
              <div className="flex gap-4 border-b border-gray-200 pb-1">
                  <button 
                      onClick={() => setTeamSubTab('drivers')}
                      className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${teamSubTab === 'drivers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                      Drivers
                  </button>
                  <button 
                      onClick={() => setTeamSubTab('packers')}
                      className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${teamSubTab === 'packers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                      Packers
                  </button>
              </div>
              
              {teamSubTab === 'drivers' ? (
                  <DriverManagement user={user} />
              ) : (
                  <PackerManagement user={user} />
              )}
          </div>
        )}

        {activeTab === 'partners' && user.role === UserRole.ADMIN && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Partner Accounts</h2>
                        <p className="text-sm text-gray-500">Manage Wholesaler and Farmer dashboard settings.</p>
                    </div>
                </div>

                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-gray-100">
                        {partners.map(p => (
                            <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                        p.role === UserRole.FARMER ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {p.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {p.businessName}
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                p.role === UserRole.FARMER ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                {p.role}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">{p.name} • {p.email}</div>
                                        {/* Added Profile Status Indicator */}
                                        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                                            {p.businessProfile?.isComplete ? (
                                                <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Profile Complete</span>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> Profile Incomplete</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <div className="text-xs text-gray-400 font-bold uppercase">Current View</div>
                                        <div className="font-medium text-gray-900 flex items-center justify-end gap-1">
                                            {p.dashboardVersion === 'v2' ? 'Advanced (v2)' : 'Simplified (v1)'}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => togglePartnerVersion(p.id, p.dashboardVersion)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                                            p.dashboardVersion === 'v2' 
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                    >
                                        {p.dashboardVersion === 'v2' ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                                        Switch to {p.dashboardVersion === 'v2' ? 'v1' : 'v2'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'employees' && user.role === UserRole.ADMIN && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">PZ Representatives</h2>
                        <p className="text-sm text-gray-500">Manage Sales and Customer Success agents.</p>
                    </div>
                    <button 
                        onClick={() => setIsEmployeeModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm font-medium"
                    >
                        <Plus size={18}/> Add Employee
                    </button>
                </div>

                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {employees.map(emp => (
                            <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-gray-500">{emp.email}</div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">
                                    Sales / Success
                                </span>
                            </div>
                        ))}
                        {employees.length === 0 && <div className="p-8 text-center text-gray-500">No employees found.</div>}
                    </div>
                </div>

                {/* Add Employee Modal */}
                {isEmployeeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Add Employee</h2>
                                <button onClick={() => setIsEmployeeModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon size={18} className="absolute left-3 top-2.5 text-gray-400"/>
                                        <input 
                                            required 
                                            type="text" 
                                            value={newEmployee.name} 
                                            onChange={e => setNewEmployee({...newEmployee,name: e.target.value})}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-2.5 text-gray-400"/>
                                        <input 
                                            required 
                                            type="email" 
                                            value={newEmployee.email} 
                                            onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
                                            placeholder="jane@platformzero.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <div className="relative">
                                        <Briefcase size={18} className="absolute left-3 top-2.5 text-gray-400"/>
                                        <select 
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                            disabled
                                        >
                                            <option>PZ Representative (Sales/Success)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Add Employee</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Complete Profile Modal */}
      <CompleteProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};
