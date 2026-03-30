import { StatusCodes } from "http-status-codes";

class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);

    this.name = "ApiError";

    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class RedisErrorResponse extends ApiError {
  constructor(
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    message = StatusCodes[statusCode] as string,
  ) {
    super(statusCode, message);
  }
}

export default ApiError;
