import React, { useState, useEffect } from 'react';
import { User, UserRole, Position } from '../types';
import { UserPlus, Settings, Shield, Trash2, Edit3, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPanelProps {
  user: User;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.PLAYER, phone: '' });

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const addedUser = await res.json();
      if (newUser.role === UserRole.PLAYER) {
        // Create player profile automatically
        await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: addedUser.id, name: addedUser.name, position: Position.SPIKER }),
        });
      }
      setShowAddUser(false);
      fetchUsers();
    }
  };

  const toggleSetting = async (key: string) => {
    const newValue = !settings[key];
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: newValue }),
    });
    setSettings({ ...settings, [key]: newValue });
  };

  return (
    <div className="space-y-8">
      {/* System Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-zinc-900" />
            <h3 className="text-lg font-bold text-zinc-900">System Controls</h3>
          </div>
          <div className="space-y-4">
            <ControlToggle 
              label="Rating Window" 
              description="Allow admins and players to submit skill ratings" 
              active={settings.ratingWindowOpen} 
              onToggle={() => toggleSetting('ratingWindowOpen')}
            />
            <ControlToggle 
              label="Auction Phase" 
              description="Enable real-time bidding and player assignments" 
              active={settings.auctionPhaseActive} 
              onToggle={() => toggleSetting('auctionPhaseActive')}
            />
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold">Admin Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowAddUser(true)}
              className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-left"
            >
              <UserPlus className="w-6 h-6 mb-2" />
              <p className="font-bold text-sm">Add User</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Create new account</p>
            </button>
            <button className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-left">
              <Trash2 className="w-6 h-6 mb-2" />
              <p className="font-bold text-sm">Reset League</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Clear all data</p>
            </button>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">User Management</h3>
          <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-xs font-bold rounded-full">{users.length} Total Users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                        {u.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      u.role === UserRole.SUPER_ADMIN ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      u.role === UserRole.CAPTAIN ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button className="p-2 text-zinc-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">Add New User</h3>
              <button onClick={() => setShowAddUser(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Full Name</label>
                <input 
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Email Address</label>
                <input 
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Role</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full mt-4 bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-all"
              >
                Create User
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ControlToggle({ label, description, active, onToggle }: { label: string; description: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
      <div className="flex-1">
        <p className="font-bold text-zinc-900">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-all ${active ? 'bg-zinc-900' : 'bg-zinc-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}
