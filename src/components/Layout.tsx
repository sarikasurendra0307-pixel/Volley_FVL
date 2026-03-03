import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, User as UserIcon, LayoutDashboard, Users, Star, Settings, Trophy, Volleyball } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, activeTab, setActiveTab, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-zinc-100">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Volleyball className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 leading-none">VolleyAuction</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1 font-bold">Pro Edition</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Users className="w-5 h-5" />} 
            label="Player Directory" 
            active={activeTab === 'directory'} 
            onClick={() => setActiveTab('directory')}
          />
          {user.role === UserRole.CAPTAIN && (
            <NavItem 
              icon={<Star className="w-5 h-5" />} 
              label="My Wishlist" 
              active={activeTab === 'wishlist'} 
              onClick={() => setActiveTab('wishlist')}
            />
          )}
          {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Admin Panel" 
              active={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')}
            />
          )}
          <NavItem 
            icon={<Trophy className="w-5 h-5" />} 
            label="Auction" 
            active={activeTab === 'auction'} 
            onClick={() => setActiveTab('auction')}
          />
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl mb-3">
            <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-zinc-900">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              System Online
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
      active ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
    }`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
