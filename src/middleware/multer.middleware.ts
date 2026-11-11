import { NextFunction, Request, RequestHandler, Response } from "express";
import { processMulterUpload } from "../common/utilis/multer/local.multer.js";


export const uploadMiddleware = ({
  isRequired = true,
  multerMiddleware,
  validation = [],
  customPath = "general",
}:{ isRequired? : boolean,
  multerMiddleware:RequestHandler,
  validation:string[] ,
  customPath?:string}) => {
  return (req:Request, res:Response, next:NextFunction) => {
    multerMiddleware(req, res, async (error?:any) => {
      if (error) {
        next(new Error(error.message, { cause: { status: 400 } }));
        return;
      }

      try {
        if (
          isRequired &&
          !req.file &&
          !(Array.isArray(req.files) && req.files.length) &&
          !(typeof req.files == "object" && Object.keys(req.files)?.length)
        ) {
          next(new Error("file is required"));
          return;
        }
        await processMulterUpload({ customPath, req, validation });
        next();
      } catch (error:any) {
        next(new Error(error.message, { cause: { status: 400 } }));
      }
    });
  };
};