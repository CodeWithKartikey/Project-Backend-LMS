/*
    Middleware to handle asynchronous route handlers
    @param {function} fn - Asynchronous route handler function
    @returns {function} - Asynchronous route handler with error handling
*/
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        // Call the asynchronous route handl
        await fn(req, res, next);
    } catch (error) {
        // Handle errors and send appropriate response
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        });
    }
}

// Export the asyncHandler middleware
export { asyncHandler };
