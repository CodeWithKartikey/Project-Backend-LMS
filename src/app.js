// Import necessary modules

// Fast, unopinionated, minimalist web framework for Node.js
import express from 'express'; 
// HTTP request logger middleware for Node.js
import morgan from 'morgan'; 
// Middleware to parse cookies
import cookieParser from 'cookie-parser'; 
// Routes for handling user profile-related requests
import UserProfileRoutes from './routes/userProfile.routes.js';
// Routes for handling course-related requests
import courseRoutes from './routes/course.routes.js'; 
// Routes for handling payment-related requests
import paymentRoutes from './routes/payment.routes.js';

// Create an Express application
const app = express();

// Middleware to parse JSON requests and set a size limit of 16kb
app.use(express.json({ limit: '16kb' }));
// Middleware to parse URL-encoded requests and set a size limit of 16kb
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
// Middleware to serve static files from the "public" directory
app.use(express.static('public'));
// Middleware for logging HTTP requests in the development environment
app.use(morgan('dev'));
// Middleware to parse cookies
app.use(cookieParser());

// Routes for handling user profile related requests
app.use('/api/v1/user-profile', UserProfileRoutes);
// Routes for handling course related requests
app.use('/api/v1/course', courseRoutes);
// Routes for handling payment related requests
app.use('/api/v1/payment', paymentRoutes);
// Middleware to handle undefined routes (404 Not Found)
app.all('*', (req, res) => {
  res.status(404).send('404 - Page not found.');
});

// Export the Express application
export default app;
