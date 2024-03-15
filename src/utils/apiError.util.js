// Custom Error class for API errors
class ApiError extends Error {
    constructor(
        statusCode, // HTTP status code of the error
        message = "Something went wrong.", // Error message (default: "Something went wrong")
        errors = [], // Additional errors (default: [])
        stack = "" // Stack trace (default: "")
    ) 
    {
        super(message); // Call the constructor of the parent class (Error)
        // Set properties specific to ApiError
        this.statusCode = statusCode; // HTTP status code of the error
        this.data = null; // Additional data (default: null)
        this.success = false; // Indicates failure (default: false)
        this.errors = errors; // Additional errors
        this.message = message; // Error message
        // If stack trace is provided, set it; otherwise, capture the stack trace
        if (stack) {
            this.stack = stack; // Provided stack trace
        } else {
            Error.captureStackTrace(this, this.constructor); // Capture stack trace
        }
    }
}

// Export the ApiError class
export { ApiError };
