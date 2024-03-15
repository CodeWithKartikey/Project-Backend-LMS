// Import necessary modules

// Router object for defining routes
import { Router } from "express"; 
// Import controller functions
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    changePassword, 
    forgotPassword, 
    resetPassword,
    userDetails,
    updateUser 
} from "../controllers/userProfile.controller.js"; 
// Middleware for handling file uploads
import { upload } from "../middlewares/multer.middleware.js"; 
// Middleware for authentication
import { isLoggedIn } from "../middlewares/auth.middleware.js"; 

// Create a new router instance
const router = Router();

// Route for user registration
router.post('/register', upload.single('avatar'), registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for user logout
router.get('/logout', isLoggedIn, logoutUser);

// Route for changing user password
router.post('/change-password', isLoggedIn, changePassword);

// Route for requesting a password reset
router.post('/forgot-password', forgotPassword);

// Route for resetting password using the token
router.post('/reset-password/:forgotToken', resetPassword);

// Route for fetching user details
router.get('/user-details', isLoggedIn, userDetails);

// Route for updating user information
router.put('/update-user', isLoggedIn, upload.single('avatar'), updateUser);

// Export the router object
export default router;
