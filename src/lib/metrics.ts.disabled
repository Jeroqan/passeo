import client from 'prom-client';

// Create a Registry to allow grouping of metrics
export const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'seo-content-panel'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define the custom metrics

export const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5], // 0.1 to 5 seconds
  registers: [register],
}); 