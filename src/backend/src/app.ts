import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './lib/logger';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import addressRoutes from './routes/address.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);

// ── Error Handler (must be registered after all routes) ──────────────────────

app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`DailyCoffee API server running on port ${PORT}`);
});

export default app;
