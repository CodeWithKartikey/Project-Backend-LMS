// Import necessary modules
import { Router } from "express";

// Import controller functions
import { 
    buyCourse, 
    verifyPurchase,
    getRazorpayKey 
} from "../controllers/payment.controller.js";

// Middleware for authentication
import { isLoggedIn } from "../middlewares/auth.middleware.js";

// Create a new router instance
const router = Router();

// Route to buy a new course
router.post('/buy-course', isLoggedIn, buyCourse);

// Route to verify the purchase of a course
router.post('/verify-purchase', isLoggedIn, verifyPurchase);

// Route to get razorpay key from the user account
router.get('/get-razorpay-key', isLoggedIn, getRazorpayKey);

// Export the router object
export default router;