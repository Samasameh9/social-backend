import { NextFunction, Request, Response } from "express";
import { IResponse } from "../common/interface/response.interface.js";

export const responseFormatter =<T=unknown> (handler: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const {
      message = true,
      status = 200,
      data = undefined,
      meta = undefined,
    }: IResponse<T> = (await handler(req, res, next)) ?? {};
    if (res.headersSent) {
      return;
    }
    return res.status(status).json({
      message: message,
      data: data,
      meta: meta,
    });
  };
};
