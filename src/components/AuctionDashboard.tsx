import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, PlayerProfile } from '../types';
import { Trophy, Clock, DollarSign, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuctionDashboardProps {
  user: User;
}

export default function AuctionDashboard({ user }: AuctionDashboardProps) {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [activePlayer, setActivePlayer] = useState<PlayerProfile | null>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch('/api/players');
    const data = await res.json();
    setPlayers(data);
    setLoading(false);
  };

  const handleMarkAsSold = async (playerId: string, teamId: string, price: number) => {
    await fetch(`/api/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSold: true, teamId, price }),
    });
    fetchPlayers(); // Refresh list after update
  };

  const availablePlayers = players.filter(p => !p.isSold);
  const soldPlayers = players.filter(p => p.isSold);

  if (loading) return <div className="animate-pulse space-y-4">...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
      {/* Left: Player List */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900">Available Players</h3>
          <span className="px-2 py-1 bg-zinc-100 text-[10px] font-bold rounded-lg">{availablePlayers.length} Left</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {availablePlayers.map(player => (
            <button
              key={player.id}
              onClick={() => setActivePlayer(player)}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                activePlayer?.id === player.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'
              }`}
            >
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center font-bold text-zinc-400">
                {player.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 truncate">{player.name}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">{player.position}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-zinc-900">{player.overallRating?.toFixed(1) || 'N/A'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Active Auction */}
      <div className="lg:col-span-2 space-y-8">
        <AnimatePresence mode="wait">
          {activePlayer ? (
            <motion.div
              key={activePlayer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Live Auction</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-48 h-48 bg-zinc-100 rounded-3xl overflow-hidden border-4 border-zinc-50 shadow-inner">
                  {activePlayer.imageUrl ? (
                    <img src={activePlayer.imageUrl} alt={activePlayer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-20 h-20 text-zinc-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl font-black text-zinc-900 mb-2">{activePlayer.name}</h2>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg uppercase tracking-wider">{activePlayer.position}</span>
                    <span className="px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider">Rating: {activePlayer.overallRating?.toFixed(1)}</span>
                  </div>

                  {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
                    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Admin Controls</p>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Winning Bid (Points)</label>
                          <input 
                            type="number" 
                            value={bidAmount} 
                            onChange={(e) => setBidAmount(parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Assign to Captain</label>
                          <select className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900">
                            <option>Select Captain...</option>
                            {/* This would be populated with actual captains */}
                          </select>
                        </div>
                        <button 
                          onClick={() => handleMarkAsSold(activePlayer.id, 'mock-captain-id', bidAmount)}
                          className="px-8 py-2 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark Sold
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <Trophy className="w-16 h-16 text-zinc-300 mb-4" />
              <h3 className="text-xl font-bold text-zinc-400">Select a player to start bidding</h3>
              <p className="text-sm text-zinc-400 mt-2">The auction phase is currently waiting for input.</p>
            </div>
          )}
        </AnimatePresence>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100">
            <h3 className="font-bold text-zinc-900">Recent Sales</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {soldPlayers.map(player => (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{player.name}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Sold for {player.price} pts</p>
                  </div>
                </div>
              ))}
              {soldPlayers.length === 0 && (
                <div className="col-span-full py-8 text-center text-zinc-400 italic text-sm">
                  No players sold yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
