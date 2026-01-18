import express from 'express';
import cors from 'cors';
import customerRoutes from './routes/customerRoutes';
import serviceRoutes from './routes/serviceRoutes';
import recurringServiceRoutes from './routes/recurringServiceRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/recurring-services', recurringServiceRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
