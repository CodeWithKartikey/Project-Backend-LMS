// Import Mongoose for MongoDB interactions
import mongoose from "mongoose";
// Set 'strictQuery' option to false for mongoose
mongoose.set('strictQuery', false);

// Function to connect to MongoDB
const connectMongoDB = async () => {
    try {
        // Attempt to establish connection to MongoDB using environment variable
        const connectionResult = await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        // Log successful connection to MongoDB
        if (connectionResult) {
            console.log(`Connected to MongoDB: ${connectionResult.connection.host}`);
        }
    } catch (error) {
        // Log error if connection to MongoDB fails
        console.error('Error connecting to MongoDB:', error);
        // Exit the process with failure code
        process.exit(1);
    }
};

// Export the function to connect to MongoDB
export default connectMongoDB;
