// routes/testSupabase.ts
import express from 'express';
import supabase from '../lib/supabaseClient';

const router = express.Router();

router.get('/test-supabase', async (_req, res) => {
  const { data, error } = await supabase.from('your_table_name').select('*').limit(1);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
});

export default router;
