import React, { useState, useEffect } from 'react';
import { User, UserRole, Position, PlayerProfile } from '../types';
import { Search, Filter, Star, User as UserIcon, ChevronRight, MoreVertical, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RatingForm from './RatingForm';

interface PlayerDirectoryProps {
  user: User;
  wishlistOnly?: boolean;
}

export default function PlayerDirectory({ user, wishlistOnly = false }: PlayerDirectoryProps) {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'All'>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    fetchPlayers();
    fetchWishlist();
  }, [user.id]);

  const fetchPlayers = async () => {
    const res = await fetch('/api/players');
    const data = await res.json();
    setPlayers(data);
  };

  const fetchWishlist = async () => {
    if (user.role === UserRole.CAPTAIN) {
      const res = await fetch(`/api/wishlist/${user.id}`);
      const data = await res.json();
      setWishlist(data);
    }
  };

  const toggleWishlist = async (playerId: string) => {
    const isWishlisted = wishlist.includes(playerId);
    if (isWishlisted) {
      await fetch(`/api/wishlist/${user.id}/${playerId}`, { method: 'DELETE' });
      setWishlist(wishlist.filter(id => id !== playerId));
    } else {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captainId: user.id, playerId }),
      });
      setWishlist([...wishlist, playerId]);
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === 'All' || p.position === positionFilter;
    const matchesWishlist = !wishlistOnly || wishlist.includes(p.id);
    return matchesSearch && matchesPosition && matchesWishlist;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <FilterButton 
            active={positionFilter === 'All'} 
            onClick={() => setPositionFilter('All')} 
            label="All" 
          />
          {Object.values(Position).map(pos => (
            <FilterButton 
              key={pos as string}
              active={positionFilter === pos} 
              onClick={() => setPositionFilter(pos)} 
              label={pos as string} 
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPlayers.map(player => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group hover:border-zinc-900 transition-all"
            >
              <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                {player.imageUrl ? (
                  <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-zinc-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {user.role === UserRole.CAPTAIN && (
                    <button 
                      onClick={() => toggleWishlist(player.id)}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        wishlist.includes(player.id) ? 'bg-amber-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${wishlist.includes(player.id) ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    {player.position}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-zinc-900 truncate">{player.name}</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-zinc-400">Rating</span>
                    <span className="text-sm font-black text-zinc-900">{player.overallRating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => { setSelectedPlayer(player); setShowRatingForm(true); }}
                    className="flex-1 bg-zinc-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Rate Player
                  </button>
                  <button className="p-2 bg-zinc-50 text-zinc-400 rounded-lg hover:bg-zinc-100 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showRatingForm && selectedPlayer && (
        <RatingForm 
          player={selectedPlayer} 
          user={user} 
          onClose={() => { setShowRatingForm(false); setSelectedPlayer(null); fetchPlayers(); }} 
        />
      )}
    </div>
  );
}

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
        active ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
      }`}
    >
      {label}
    </button>
  );
}
