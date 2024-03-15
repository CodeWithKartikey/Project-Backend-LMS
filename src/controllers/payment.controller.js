// Importing required modules

// Library for cryptographic operations 
import crypto from 'crypto'; 
// Importing razorpay module
import Razorpay from 'razorpay';
// Importing the Payment model
import Payment from '../models/payment.model.js';
// Importing the User model
import User from '../models/userProfile.model.js';
// Utility functions for handling errors, responses, and asynchronous operations
import { ApiError } from '../utils/apiError.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

// Initialize Razorpay with API keys & secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/*
  Handles the purchase of a course.

  @param {Object} req - The request object.
  @param {Object} res - The response object.
  @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const buyCourse = asyncHandler(async (req, res) => {
  // Extract user id from request
  const { id } = req.user;
  // Destructure request body
  const { amount } = req.body;

  // Find user by id and exclude password field
  const user = await User.findById(id).select("-password");
  if (!user) {
    // If user is not logged in / does not exist, throw 404 error
    throw new ApiError(404, "User is not logged in, Please log in.");
  }

  // Check if user role is admin or not
  if (user.role === "admin") {
    throw new ApiError(400, "Admin user is not allowed to buy courses.");
  }

  // Validate amount
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid amount provided.");
  }

  // Creating an order using Razorpay
  const order = await razorpay.orders.create({
    amount: amount * 100, // Convert amount to paisa
    currency: "INR", // Example currency
    receipt: `Course_JS_Beginner_${user._id.toString().substring(0, 5)}` // Unique receipt for each transaction
  });

  // Create a new order
  const newOrder = {
    order_id: order.id,
    receipt_id: order.receipt,
    status: order.status,
  }

  // Push the new order into the orders array of the user model
  user.orders.push(newOrder);

  // Save the updated user data
  await user.save();

  // Respond with the order details
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Your order has been created."));
});

/*
  Verifies the purchase of a course.

  @param {Object} req - The request object.
  @param {Object} res - The response object.
  @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const verifyPurchase = asyncHandler(async (req, res) => {
  // Extract user id from request
  const { id } = req.user;
  // Destructure request body
  const { order_id, payment_id, signature, amount, currency } = req.body;

  // Find user by id and exclude password field
  const user = await User.findById(id).select("-password");

  if (!user) {
    // If user is not logged in / does not exist, throw 404 error
    throw new ApiError(404, "User is not logged in, Please log in.");
  }

  // Extract relevant user information
  const { name, email, mobile } = user;

  // Finding the order with the provided order_id
  const order = user.orders.find(order => order.order_id === order_id);
  if(!order) {
    // If order is not found, throw 404 error
    throw new ApiError(404, "Order does not exist.");
  }
  // Set the order ID accordingly
  const orderId = order?.order_id;

  // Generate the signature so we can validate the signature against the signature we got from frontend part.
  const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${payment_id}`).digest('hex');

  // Check if generated signature and signature received from the frontend is the same or not
  if (generated_signature !== signature) {
    throw new ApiError(400, 'Payment not verified, please try again.')
  }
  
  // If the signatures match, create payment and store it in the database
  const payment = await Payment.create({ 
    name, 
    email, 
    mobile, 
    order_id, 
    payment_id, 
    signature, 
    amount, 
    currency, 
    status: 'done' // Set the status to 'done'
  });

  // Set the order status accordingly after the update
  order.status = 'active';
  
  // Save the user in the DB with any changes
  await user.save();

  // Respond with the order details
  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment verified successfully."));
});

/*
  Get the razorpay key.

  @param {Object} req - The request object.
  @param {Object} res - The response object.
  @returns {Object} - JSON response indicating the success or failure of the lecture creation.
*/
const getRazorpayKey = asyncHandler(async (req, res) => {
  // Extract user id from request
  const { id } = req.user;

  // Find user by id and exclude password field
  const user = await User.findById(id).select("-password");

  if (!user) {
    // If user is not logged in / does not exist, throw 404 error
    throw new ApiError(404, "User is not logged in, Please log in.");
  }

  // Retrieve Razorpay key from environment variables
  const razorpayKey = process.env.RAZORPAY_KEY_ID;
  // If Razorpay key is not available, throw 404 error
  if(!razorpayKey) {
    throw new ApiError(404, "There is no Razorpay key available for this user.");
  }

  // Respond with the razorpay key details
  return res
    .status(200)
    .json(new ApiResponse(200, razorpayKey, "Successfully get the Razorpay key."));
})

export { buyCourse, verifyPurchase, getRazorpayKey };
