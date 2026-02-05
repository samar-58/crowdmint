import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Import routes
import healthRouter from './routes/health.js';
import userRouter from './routes/user/index.js';
import workerRouter from './routes/worker/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/user', userRouter);
app.use('/api/worker', workerRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
