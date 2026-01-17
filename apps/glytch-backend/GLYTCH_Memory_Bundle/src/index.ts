// src/index.ts
import express from 'express';
import cors from 'cors';
import testSupabase from './routes/testSupabase';

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api', testSupabase); // Available at /api/test-supabase

app.listen(3001, () => console.log('Server running on port 3001'));
