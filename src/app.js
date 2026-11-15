import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; // Import the new route

const app = express();

app.use(cors({ origin: '*' }));

// ⚠️ IMPORTANT: We do NOT use express.json() here globally anymore.
// The auth route needs raw body to verify Supabase signatures.

app.use('/api/auth', authRoutes); // Add the auth routes

// Re-add json for other future routes (like Cashfree)
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Dhenora API is running smoothly' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

export default app;