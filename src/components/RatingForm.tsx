import React, { useState } from 'react';
import { User, PlayerProfile } from '../types';
import { X, Star, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface RatingFormProps {
  player: PlayerProfile;
  user: User;
  onClose: () => void;
}

export default function RatingForm({ player, user, onClose }: RatingFormProps) {
  const [metrics, setMetrics] = useState({
    serving: 5,
    passing: 5,
    setting: 5,
    spiking: 5,
    blocking: 5,
    defense: 5,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id,
          raterId: user.id,
          ...metrics,
        }),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricChange = (metric: string, value: number) => {
    setMetrics(prev => ({ ...prev, [metric]: value }));
  };

  const overall = (Object.values(metrics) as number[]).reduce((a: number, b: number) => a + b, 0) / 6;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-bold">
              {player.name[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{player.name}</h3>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{player.position}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <MetricSlider label="Serving" value={metrics.serving} onChange={(v) => handleMetricChange('serving', v)} />
            <MetricSlider label="Passing" value={metrics.passing} onChange={(v) => handleMetricChange('passing', v)} />
            <MetricSlider label="Setting" value={metrics.setting} onChange={(v) => handleMetricChange('setting', v)} />
            <MetricSlider label="Spiking" value={metrics.spiking} onChange={(v) => handleMetricChange('spiking', v)} />
            <MetricSlider label="Blocking" value={metrics.blocking} onChange={(v) => handleMetricChange('blocking', v)} />
            <MetricSlider label="Defense" value={metrics.defense} onChange={(v) => handleMetricChange('defense', v)} />
          </div>

          <div className="mt-8 p-6 bg-zinc-900 rounded-2xl flex items-center justify-between">
            <div className="text-white">
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Calculated Overall</p>
              <p className="text-3xl font-black">{overall.toFixed(1)}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function MetricSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-zinc-700">{label}</label>
        <span className="text-sm font-black text-zinc-900 bg-zinc-100 px-2 py-1 rounded-lg">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
      />
    </div>
  );
}
