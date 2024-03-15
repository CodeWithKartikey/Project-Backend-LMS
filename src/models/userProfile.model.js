// Import necessary modules

// Library for password hashing
import bcrypt from 'bcryptjs'; 
// Library for generating JSON Web Tokens (JWT)
import JWT from 'jsonwebtoken';
// Library for cryptographic operations 
import crypto from 'crypto'; 
// Schema and model objects from Mongoose for MongoDB interactions
import { Schema, model } from "mongoose"; 

/*
    User Schema definition
*/
const userSchema = new Schema(
    {
        // Avatar details
        avatar: {
            type: 'String'
        },
        // User's name
        name: {
            type: 'String',
            required: [true, 'Name is required.'],
            minLength: [3, 'Name must be at least 3 characters long.'],
            maxLength: [50, 'Name should be less than 50 characters long.'],
            lowercase: true,
            trim: true
        },
        // User's bio
        bio: {
            type: 'String',
            required: [true, 'Bio is required.'],
            lowercase: true,
            trim: true
        },
        // User's email
        email: {
            type: 'String',
            required: [true, 'Email is required.'],
            lowercase: true,
            unique: true,
            trim: true
        },
        // User's mobile number
        mobile: {
            type: 'String',
            required: [true, 'Mobile number is required.'],
            unique: true,
            trim: true,
        },
        // User's password
        password: {
            type: 'String',
            required: [true, 'Password is required.'],
            minLength: [8, 'Password must be at least 8 characters long.'],
            select: false
        },
        // User's order
        orders: [{
            order_id: {
                type: 'String',
            },
            receipt_id: {
                type: 'String',
            },
            status: {
                type: 'String',
            }
        }],
        // Token for password reset
        forgotPasswordToken: {
            type: 'String'
        },
        // Expiry date for password reset token
        forgotPasswordExpiryDate: {
            type: 'String'
        },
        // User's role
        role: {
            type: 'String',
            enum: ['USER', 'ADMIN'],
            default: 'USER',
        },
    }, { timestamps: true }
);

/*
    Middleware to hash password before saving to the database,
    It hashes the password using bcrypt if it has been modified
*/
userSchema.pre('save', async function (next) {
    // Check if the password field has been modified
    if (!this.isModified('password')) {
        // If not modified, proceed to the next middleware
        return next();
    }
    // Hash the password using bcrypt with a cost factor of 10
    this.password = await bcrypt.hash(this.password, 10);
    // Proceed to the next middleware
    next();
});

/*
    Method to check if the provided password is correct
    @param {string} password - The password to check
    @returns {boolean} - True if the password is correct, false otherwise
*/
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

/*
    Method to generate JWT token for user authentication
    @returns {string} - JWT token
*/
userSchema.methods.generateJWTToken = function() {
    return JWT.sign(
        // Sign the JWT payload including user ID, email, and role
        { 
            id: this._id, 
            email: this.email, 
            role: this.role 
        },
        // Secret key for signing JWT
        process.env.JWT_SECRET, 
        // Expiration time for JWT
        { 
            expiresIn: process.env.JWT_EXPIRY 
        }
    );
}

/*
    Method to generate password reset token
    @returns {string} - Password reset token
*/
userSchema.methods.generatePasswordResetToken = function() {
    // Generate a random token using cryptographic operations
    const forgotToken = crypto.randomBytes(20).toString('hex');
    // Hash the generated token using SHA-256 algorithm and update the user's forgotPasswordToken field
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');
    // Set the expiry date for the password reset token (15 minutes from the current time)
    this.forgotPasswordExpiryDate = Date.now() + 15 * 60 * 1000; 
    // Return the generated token
    return forgotToken;
}

/*
    User Model definition
*/
const userProfile = model('User', userSchema);


// Exporting the userProfile object as the default export.
export default userProfile;
