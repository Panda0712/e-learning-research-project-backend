import { NextFunction, Request, Response } from "express";

const asyncHandler = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  asyncHandler,
};
