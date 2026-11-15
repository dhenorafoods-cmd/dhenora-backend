import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: '*' })); 
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