class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
export default ApiError;
//# sourceMappingURL=ApiError.js.map