// Class for constructing API response objects
class ApiResponse {
    /*
        Constructor for ApiResponse
        @param {number} statusCode - HTTP status code of the response
        @param {object} data - Data to be included in the response
        @param {string} message - Message associated with the response (default: "Success")
    */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode; // HTTP status code of the response
        this.success = statusCode < 400; // Indicates success if status code is less than 400
        this.data = data; // Data to be included in the response
        this.message = message; // Message associated with the response
    }
}

// Export the ApiResponse class
export { ApiResponse };
