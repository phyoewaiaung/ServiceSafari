import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for frontend
app.use(morgan('combined')); // HTTP request logging
app.use(express.json()); // Parse JSON bodies

// Service configuration
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    name: 'Authentication Service'
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003',
    name: 'Analytics Service'
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    port: PORT,
    services: Object.keys(services)
  });
});

// Service status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const statusChecks = await Promise.allSettled(
      Object.entries(services).map(async ([key, service]) => {
        try {
          const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
          return {
            name: service.name,
            status: 'running',
            url: service.url,
            response: response.data
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'error',
            url: service.url,
            error: error.message
          };
        }
      })
    );

    const results = statusChecks.map((result, index) => ({
      key: Object.keys(services)[index],
      ...result.value
    }));

    res.json({
      gateway: {
        status: 'running',
        port: PORT
      },
      services: results
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check service status',
      message: error.message
    });
  }
});

// Proxy routes to services
app.use('/api/auth', async (req, res, next) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.auth.url}${req.originalUrl.replace('/api/auth', '')}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

app.use('/api/analytics', async (req, res, next) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.analytics.url}${req.originalUrl.replace('/api/analytics', '')}`,
      data: req.body,
      headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚪 API Gateway is running!',
    service: 'Microservices API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      status: '/api/status',
      auth: '/api/auth/*',
      analytics: '/api/analytics/*'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Gateway Error:', error);
  res.status(error.response?.status || 500).json({
    error: 'Gateway Error',
    message: error.message,
    service: error.response?.data?.service || 'Unknown'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/health', '/api/status', '/api/auth/*', '/api/analytics/*']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Service status: http://localhost:${PORT}/api/status`);
  console.log(`🎯 Ready to route requests!`);
});
