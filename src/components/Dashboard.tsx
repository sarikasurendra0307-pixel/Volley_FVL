import React from 'react';
import { User, UserRole } from '../types';
import PlayerDirectory from './PlayerDirectory';
import AdminPanel from './AdminPanel';
import AuctionDashboard from './AuctionDashboard';
import { Trophy, Users, Star, Activity } from 'lucide-react';

interface DashboardProps {
  user: User;
  activeTab: string;
}

export default function Dashboard({ user, activeTab }: DashboardProps) {
  switch (activeTab) {
    case 'directory':
      return <PlayerDirectory user={user} />;
    case 'admin':
      return <AdminPanel user={user} />;
    case 'auction':
      return <AuctionDashboard user={user} />;
    case 'wishlist':
      return <PlayerDirectory user={user} wishlistOnly />;
    default:
      return <Overview user={user} />;
  }
}

function Overview({ user }: { user: User }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-600" />} label="Total Players" value="96" />
        <StatCard icon={<Trophy className="text-amber-600" />} label="Captains" value="16" />
        <StatCard icon={<Activity className="text-emerald-600" />} label="Rated Players" value="42 / 96" />
        <StatCard icon={<Star className="text-purple-600" />} label="Auction Status" value="Pre-Auction" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem text="Admin updated player 'John Doe' rating" time="2 mins ago" />
            <ActivityItem text="Captain 'Sarah' added a player to wishlist" time="15 mins ago" />
            <ActivityItem text="New player profile 'Mike' created" time="1 hour ago" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-left hover:bg-zinc-100 transition-all">
              <p className="font-bold text-zinc-900">Rate Players</p>
              <p className="text-xs text-zinc-500">Submit skill evaluations</p>
            </button>
            <button className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-left hover:bg-zinc-100 transition-all">
              <p className="font-bold text-zinc-900">Scout Players</p>
              <p className="text-xs text-zinc-500">View directory & stats</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
      <p className="text-sm text-zinc-600">{text}</p>
      <span className="text-[10px] font-bold text-zinc-400 uppercase">{time}</span>
    </div>
  );
}
