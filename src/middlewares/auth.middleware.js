// Import JSON Web Token (JWT) module for token verification
import JWT from 'jsonwebtoken';
// Import User model for user authentication
import User from '../models/userProfile.model.js';

// Middleware to check if the user is logged in
const isLoggedIn = async (req, res, next) => {
    try {
        // Extract token from cookies
        const { token } = req.cookies;
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access! Please login first.'
            });
        }
        // Verify the token using the secret key
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
        // Find user by ID from decoded token and exclude password field
        const user = await User.findById(decodedToken?.id).select("-password");
        // If user not found, return invalid access token error
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Access Token.'
            });
        }
        // Set user object in request for further access
        req.user = user;
        // Proceed to the next middleware
        next(); 
    } catch (error) {
        // Return server error if any exception occurs
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/*
    Middleware to authorize user roles for accessing routes
    @param {...string} roles - Roles allowed to access the route
*/
const authorizeRoles = (...roles) => async (req, res, next) => {
    try {
        // Check if user's role matches any of the specified roles
        if (!roles.includes(req.user.role)) {
            // Return 403 Forbidden if user does not have permission
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view this route."
            });
        }
        // Proceed to the next middleware if authorization is successful
        next();
    } catch (error) {
        // Return 500 Internal Server Error if any exception occurs
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export the isLoggedIn middleware function
export { isLoggedIn, authorizeRoles };
