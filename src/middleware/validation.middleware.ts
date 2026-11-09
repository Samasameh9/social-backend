import { NextFunction, Request, Response } from "express";
import { LanguageEnum } from "../common/enum/security.enum.js";
import { BadRequestException } from "../common/exception/domain.exception.js";
import type{ ZodType } from "zod";

type validationInputType=(lang:LanguageEnum)=>ZodType
export const validation = (schema:validationInputType) => {
  return (req:Request, res:Response, next:NextFunction) => {
   
    const lang=Number(req.headers['accept-language'] ?? LanguageEnum.EN)
    const validationResult = schema(lang).safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
  
    });
    if (!validationResult.success) {
      throw new BadRequestException(
         "validation Error",
       validationResult.error.issues,
      );
    }
    req.validate = validationResult.data;
    next();
  };
};
