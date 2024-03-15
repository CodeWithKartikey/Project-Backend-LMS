// Importing required modules

// Library for password hashing
import bcrypt from 'bcryptjs'; 
// Library for cryptographic operations 
import crypto from 'crypto'; 
// Library for email validation
import emailValidator from 'email-validator'; 
// Importing the User model
import User from '../models/userProfile.model.js';
// Utility function for sending emails 
import sendEmail from '../utils/sendEmail.util.js'; 
// Utility functions for handling errors, responses, and asynchronous operations
import { ApiError } from '../utils/apiError.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
// Utility functions for handling Cloudinary operations - upload and remove
import { 
    uploadOnCloudinary,        
    removeFromCloudinary 
} from "../utils/cloudinary.util.js";


/*
    Controller function to register a new user.
    Handles the HTTP POST request to register a user.

    @param {Object} req - The HTTP request object.
    @param {Object} res - The HTTP response object.
    @returns {Object} HTTP response with JSON data.
*/
const registerUser = asyncHandler(async (req, res) => {
    // Destructure request body
    const { name, bio, email, mobile, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !bio || !email || !mobile || !password || !confirmPassword) {
        throw new ApiError(400, "All fields must be filled.");
    }

    // Check if user with the same email already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
        throw new ApiError(400, "Email-ID is already exist.");
    }

    // Validate email format
    const validateEmail = emailValidator.validate(email);
    if (!validateEmail) {
        throw new ApiError(400, "Email-ID must be in valid format.");
    }

    // Check if password matches confirmPassword
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password & Confirm password should be matched.");
    }

    // Get the local path of the avatar file from request
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.");
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Error uploading to Cloudinary.");
    }

    // Create new user
    const user = await User.create({ 
        avatar: avatar.url,
        name,
        bio, 
        email, 
        mobile, 
        password 
    });

    // Find and return the newly created user (excluding password field)
    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.");
    }

    // Respond with success message and created user data
    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User successfully registered."));
});

/*
    Controller function to log in a user.
    Handles the HTTP POST request to log in a user.

    @param {Object} req - The HTTP request object.
    @param {Object} res - The HTTP response object.
    @returns {Object} HTTP response with JSON data.
*/
const loginUser = asyncHandler(async (req, res) => {
    // Destructure request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        throw new ApiError(400, "All fields must be filled.");
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(404, "Invalid Email-ID or Password.");
    }

    // Check if provided password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Email-ID or Password.");
    }

    // Generate JWT token for authentication
    const token = user.generateJWTToken();

    // Find logged in user and exclude password field
    const loggedInUser = await User.findById(user._id).select("-password");

    // Set cookie options for authentication token
    const cookieOptions = { 
        maxAge: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
        secure: true, // Ensure cookie is only sent over HTTPS
        httpOnly: true // Prevent client-side access to cookie
    };

    // Return response with token in cookie and logged in user data
    return res
        .status(200)
        .cookie('token', token, cookieOptions)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully."));
});

/*
    Controller function to log out a user.
    Handles the HTTP GET request to log out a user.

    @param {Object} req - The HTTP request object.
    @param {Object} res - The HTTP response object.
    @returns {Object} HTTP response with JSON data.
*/
const logoutUser = asyncHandler(async (req, res) => {
    // Extract user id from request
    const { id } = req.user;

    // Find user by id and exclude password field
    const user = await User.findById(id).select("-password");
    if (!user) {
        // If user is not logged in / does not exist, throw 404 error
        throw new ApiError(404, "User is not logged in, Please log in or does not exist.");
    }

    // Set cookie options for deleting token cookie
    const cookieOptions = { 
        maxAge: 0, // Expire cookie immediately
        secure: true, // Ensure cookie is only sent over HTTPS
        httpOnly: true // Prevent client-side access to cookie
    };

    // Remove token cookie and return success response
    return res
        .status(200)
        .cookie('token', null, cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully."));
});

/*
    Controller function to change user password.

    @param {Object} req - Express request object.
    @param {Object} res - Express response object.
    @returns {Object} JSON response indicating success or failure.
*/
const changePassword = asyncHandler(async (req, res) => {
    // Extracting user id from request
    const { id } = req.user;
    
    // Extracting old and new passwords from request body
    const { oldPassword, newPassword } = req.body;
    
    // Checking if both old and new passwords are provided
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords must be provided.");
    }

    // Finding user by id and selecting password field
    let user = await User.findById(id).select('+password');
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Checking if old password matches the stored password
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid old password.");
    }
    
    // Checking if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
        throw new ApiError(400, "New password should not match the old password.");
    }

    // Update user with new password and exclude password field
    user = await User.findByIdAndUpdate(
        id,
        { $set: { password: newPassword } },
        { new: true }
    ).select("-password");
    
    // Sending success response
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Password changed successfully."));
});


/*
    Controller function to handle password reset request.
    Sends an email with a password reset link to the user.

    @param {Object} req - The HTTP request object.
    @param {Object} res - The HTTP response object.
    @returns {Object} HTTP response with JSON data.
*/
const forgotPassword = asyncHandler(async (req, res) => {
    // Destructure request body
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        throw new ApiError(400, "Email address is required.")
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, "The provided email address does not exist. Please register.")
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Generate password reset URL
    const resetPasswordUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

    // Compose email
    const subject = 'Password Reset Request';
    const message = `You have requested to reset your password. Please click the following link to reset your password: <a href="${resetPasswordUrl}" target="_blank">Reset Password</a>. If the link is not clickable, please copy and paste it into your browser.`;

    // Send email
    await sendEmail(email, subject, message);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, `A password reset link has been sent successfully to ${email}. Please check your email inbox.`));
});


/*
    Controller function to handle password reset.
    Resets the user's password based on the reset token.

    @param {Object} req - The HTTP request object.
    @param {Object} res - The HTTP response object.
    @returns {Object} HTTP response with JSON data.
*/
const resetPassword = asyncHandler(async (req, res) => {
    // Extracting forget token from request parameters
    const { forgotToken } = req.params;
    // Destructure request body
    const { password } = req.body;

    // Hash the reset token for comparison
    const hashedToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

    // Find user by the hashed reset token and check if it's not expired
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiryDate: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(401, "Invalid or expired token. Please try again.");
    }

    // Reset user's password
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiryDate = undefined;

    // Save the updated user document
    await user.save();

    // Remove password field from the response
    user.password = undefined;

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Password reset successfully."));
});


/*
    Controller function to retrieve user details.
    Handles the HTTP GET request to retrieve user details. 

    @param {Object} req - The HTTP request object.
    @param {Object} res - The HTTP response object.
    @returns {Object} HTTP response with JSON data.
*/
const userDetails = asyncHandler(async (req, res) => {
    // Extract user id from request
    const { id } = req.user;

    // Find user by id and exclude password field
    const user = await User.findById(id).select("-password");

    // Check if user exists
    if (!user) {
        // If user is not logged in or does not exist, throw 404 error
        throw new ApiError(404, "User is not logged in, Please log in or does not exist.");
    }

    // Return user details in response
    return res
        .status(200)
        .json(new ApiResponse(200, user, `Hello ${user?.name}, This is your details.`));  
});

/*
    Controller function to update user details.
    Handles the HTTP PUT request to update user details. 

    @param {Object} req - The HTTP request object.
    @param {Object} res - The HTTP response object.
    @returns {Object} HTTP response with JSON data.
*/
const updateUser = asyncHandler(async (req, res) => {
    // Extract user id from request
    const { id } = req.user;
    // Destructure request body
    const { name, bio } = req.body;

    // Find user by ID
    let user = await User.findById(id).select("-password");
    if (!user) {
        throw new ApiError(404, "User is not logged in or does not exist.");
    }

    // Update user details if provided in request body
    if (name) {
        user.name = name;
    }
    if (bio) {
        user.bio = bio;
    }

    // Update avatar if a new file is uploaded
    const avatarLocalPath = req.file?.path;
    if (avatarLocalPath) {
        // Remove previous avatar from Cloudinary if it exists
        if (user.avatar && user.avatar.url) {
            await removeFromCloudinary(user.avatar.url);
        }

        // Upload new avatar to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new ApiError(400, "Error uploading to Cloudinary.");
        }

        // Update user with new avatar URL
        user = await User.findByIdAndUpdate(
            id,
            { $set: { avatar: avatar.url } },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Avatar image updated successfully."));
    } else {
        // No new avatar uploaded, return updated user details
        user = await User.findById(id).select("-password");
        return res
            .status(200)
            .json(new ApiResponse(200, user, "User details updated successfully."));
    }
});

export { registerUser, loginUser, logoutUser, changePassword, forgotPassword, resetPassword, userDetails, updateUser };
