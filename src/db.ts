import { createClient } from '@supabase/supabase-js';
import { UserRole, Position } from './types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL for Supabase Editor (User must run this in Supabase Dashboard):
/*
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    password TEXT
  );

  CREATE TABLE players (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    image_url TEXT,
    team_id TEXT REFERENCES users(id),
    is_sold BOOLEAN DEFAULT FALSE,
    price INTEGER DEFAULT 0
  );

  CREATE TABLE ratings (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL REFERENCES players(id),
    rater_id TEXT NOT NULL REFERENCES users(id),
    serving INTEGER NOT NULL,
    passing INTEGER NOT NULL,
    setting INTEGER NOT NULL,
    spiking INTEGER NOT NULL,
    blocking INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    overall REAL NOT NULL,
    timestamp BIGINT NOT NULL
  );

  CREATE TABLE wishlists (
    captain_id TEXT NOT NULL REFERENCES users(id),
    player_id TEXT NOT NULL REFERENCES players(id),
    PRIMARY KEY(captain_id, player_id)
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
*/

export async function seedDatabase() {
  if (!supabaseUrl || !supabaseAnonKey) return;

  // Seed settings
  await supabase.from('settings').upsert([
    { key: 'ratingWindowOpen', value: 'true' },
    { key: 'auctionPhaseActive', value: 'false' }
  ]);

  // Seed Admin
  await supabase.from('users').upsert([
    { id: 'admin-1', email: 'admin@example.com', name: 'Super Admin', role: UserRole.SUPER_ADMIN, password: 'Surisari@122161' },
    { id: 'admin-2', email: 'surizb4u@gmail.com', name: 'Super Admin Suri', role: UserRole.SUPER_ADMIN, password: 'Surisari@122161' }
  ]);

  // Seed Dummy Players
  const categories = [
    { pos: Position.SPIKER, prefix: 'Spiker' },
    { pos: Position.SETTER, prefix: 'Setter' },
    { pos: Position.DEFENDER, prefix: 'Defender' }
  ];

  for (const cat of categories) {
    for (let i = 1; i <= 3; i++) {
      const id = `${cat.prefix.toLowerCase()}-${i}`;
      const userId = `user-${id}`;
      const name = `${cat.prefix} ${i}`;
      const email = `${id}@example.com`;
      
      await supabase.from('users').upsert({ id: userId, email, name, role: UserRole.PLAYER });
      
      const srv = 6 + Math.floor(Math.random() * 4);
      const pas = 6 + Math.floor(Math.random() * 4);
      const set = cat.pos === Position.SETTER ? 8 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 4);
      const spk = cat.pos === Position.SPIKER ? 8 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 4);
      const blk = 5 + Math.floor(Math.random() * 5);
      const def = cat.pos === Position.DEFENDER ? 8 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 4);
      const overall = (srv + pas + set + spk + blk + def) / 6;
      
      await supabase.from('players').upsert({ id, user_id: userId, name, position: cat.pos });
      await supabase.from('ratings').upsert({ 
        id: `rating-${id}`, 
        player_id: id, 
        rater_id: 'admin-1', 
        serving: srv, 
        passing: pas, 
        setting: set, 
        spiking: spk, 
        blocking: blk, 
        defense: def, 
        overall, 
        timestamp: Date.now() 
      });
    }
  }
}
