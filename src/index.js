// Import necessary modules

// Middleware for enabling Cross-Origin Resource Sharing (CORS)
import cors from 'cors';
// Library for loading environment variables from a .env file
import dotConfig from 'dotenv'; 
// Main Express application
import app from './app.js'; 
// Function to connect to MongoDB
import connectMongoDB from './db/db.config.js'; 

// Load environment variables from .env file
dotConfig.config();

// Enable CORS middleware for the application
app.use(cors({
  origin: [process.env.CORS_ORIGIN],
  credentials: true
}));

// Define the port on which the server will listen
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, async () => {
  // Connect to MongoDB
  await connectMongoDB();
  // Log server's address upon successful startup
  console.log(`App is running at http://localhost:${PORT}/.`);
});
