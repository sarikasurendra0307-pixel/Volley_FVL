import express from 'express';
import { createServer as createViteServer } from 'vite';
import { supabase, seedDatabase } from './src/db';
import { UserRole } from './src/types';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

// Seed database on startup
seedDatabase().catch(console.error);

// API Routes
// Auth
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Users
  app.get('/api/users', async (req, res) => {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(users);
  });

  app.post('/api/users', async (req, res) => {
    const { name, email, role, phone } = req.body;
    const id = uuidv4();
    const { data: user, error } = await supabase
      .from('users')
      .insert({ id, name, email, role, phone })
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: 'Email already exists or invalid data' });
    res.json(user);
  });

  // Players
  app.get('/api/players', async (req, res) => {
    // In Supabase, we can use a view or a complex query. 
    // For simplicity, we'll fetch players and users separately or use a join if possible.
    // Supabase supports joins if foreign keys are defined.
    const { data: players, error } = await supabase
      .from('players')
      .select(`
        *,
        users!user_id (email, name)
      `);
    
    if (error) return res.status(500).json({ error: error.message });

    // Fetch ratings to calculate overallRating
    const { data: ratings } = await supabase.from('ratings').select('player_id, overall');

    const formattedPlayers = players.map(p => {
      const playerRatings = ratings?.filter(r => r.player_id === p.id) || [];
      const overallRating = playerRatings.length > 0 
        ? playerRatings.reduce((acc, curr) => acc + curr.overall, 0) / playerRatings.length 
        : 0;

      return {
        ...p,
        userId: p.user_id,
        imageUrl: p.image_url,
        teamId: p.team_id,
        isSold: p.is_sold,
        email: (p.users as any)?.email,
        user_name: (p.users as any)?.name,
        overallRating
      };
    });

    res.json(formattedPlayers);
  });

  app.post('/api/players', async (req, res) => {
    const { userId, name, position, imageUrl } = req.body;
    const id = uuidv4();
    const { data: player, error } = await supabase
      .from('players')
      .insert({ id, user_id: userId, name, position, image_url: imageUrl })
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(player);
  });

  app.patch('/api/players/:id', async (req, res) => {
    const { id } = req.params;
    const { position, imageUrl, teamId, isSold, price } = req.body;
    
    const updates: any = {};
    if (position) updates.position = position;
    if (imageUrl) updates.image_url = imageUrl;
    if (teamId !== undefined) updates.team_id = teamId;
    if (isSold !== undefined) updates.is_sold = isSold;
    if (price !== undefined) updates.price = price;
    
    if (Object.keys(updates).length > 0) {
      const { data: player, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) return res.status(400).json({ error: error.message });
      
      res.json(player);
    } else {
      res.status(400).json({ error: 'No updates provided' });
    }
  });

  // Ratings
  app.get('/api/ratings/:playerId', async (req, res) => {
    const { playerId } = req.params;
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('player_id', playerId);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(ratings);
  });

  app.post('/api/ratings', async (req, res) => {
    const { playerId, raterId, serving, passing, setting, spiking, blocking, defense } = req.body;
    const id = uuidv4();
    const overall = (serving + passing + setting + spiking + blocking + defense) / 6;
    const timestamp = Date.now();
    
    const { data: rating, error } = await supabase
      .from('ratings')
      .insert({ 
        id, 
        player_id: playerId, 
        rater_id: raterId, 
        serving, 
        passing, 
        setting, 
        spiking, 
        blocking, 
        defense, 
        overall, 
        timestamp 
      })
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.json(rating);
  });

  // Settings
  app.get('/api/settings', async (req, res) => {
    const { data: settings, error } = await supabase.from('settings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    
    const config: any = {};
    settings.forEach((s: any) => config[s.key] = s.value === 'true');
    res.json(config);
  });

  app.patch('/api/settings', async (req, res) => {
    const { key, value } = req.body;
    const { error } = await supabase
      .from('settings')
      .update({ value: value.toString() })
      .eq('key', key);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ key, value });
  });

  // Wishlist
  app.get('/api/wishlist/:captainId', async (req, res) => {
    const { captainId } = req.params;
    const { data: wishlist, error } = await supabase
      .from('wishlists')
      .select('player_id')
      .eq('captain_id', captainId);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(wishlist.map((w: any) => w.player_id));
  });

  app.post('/api/wishlist', async (req, res) => {
    const { captainId, playerId } = req.body;
    const { error } = await supabase
      .from('wishlists')
      .upsert({ captain_id: captainId, player_id: playerId });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete('/api/wishlist/:captainId/:playerId', async (req, res) => {
    const { captainId, playerId } = req.params;
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('captain_id', captainId)
      .eq('player_id', playerId);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
