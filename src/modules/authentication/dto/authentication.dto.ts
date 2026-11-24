import z from "zod";
import { confirmEmailValidation, login, resendConfirmEmailValidation, signup } from "../authentication.validation.js";



export type signupTypeDto=z.infer<ReturnType<typeof signup>>
export type confirmEmailDto=z.infer<ReturnType<typeof confirmEmailValidation>>['body']
export type resendConfirmEmailDto=z.infer<ReturnType<typeof resendConfirmEmailValidation>>['body']
export type loginDto=z.infer<ReturnType<typeof login>>['body']


