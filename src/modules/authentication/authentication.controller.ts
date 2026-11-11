import { Router, type Router as RouterType } from "express";
import type { Request, Response, NextFunction } from "express";
import authenticationService from "./authentication.service";
import { responseFormatter } from "../../middleware/response.middleware.js";
import * as validators from "./authentication.validation";
import { validation } from "../../middleware/validation.middleware";
import { IResponse } from "../../common/interface/response.interface.js";
import { IUser } from "../../common/interface/user.interface.js";
import { getIssuer } from "../../common/utilis/issuer.js";
import { ILoginResponse } from "./entities/authentication.entity.js";
const router: RouterType = Router({ strict: true, caseSensitive: true });
// sign up
router.post(
  "/signup",
  validation(validators.signup),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<IUser>> => {
      const data = await authenticationService.signup(req.validate.body);
      return { status: 201, data };
    },
  ),
);
//================================================
// confirm email
router.patch(
  "/confirm-email",
  validation(validators.confirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    return await authenticationService.confirmEmail(req.validate.body);
  }),
);
//===========================================
// enable 2 step verification
router.patch(
  "/enable-two-step-verification",
  validation(validators.resendConfirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await authenticationService.enableTwoStepVerification(
      req.validate.body,
    );
    return { res, status: 200, data };
  }),
);
//==============================================
// resend confirm email
router.patch(
  "/resend-confirm-email",
  validation(validators.resendConfirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    return await authenticationService.resendConfirmEmail(req.validate.body);
  }),
);
//============================================
//signup with gma0il
router.post(
  "/signup-with-gmail",
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<ILoginResponse>> => {
      const { data, status } = await authenticationService.signupWithGmail(
        req.body,
        getIssuer(req),
      );
      return { status: 201, data };
    },
  ),
);
//====================================================
// forgot password
router.post(
  "/request-forgot-password",
  validation(validators.resendConfirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await authenticationService.requestForgotPassword(
      req.validate.body,
    );
    return { status: 200, data };
  }),
);

router.post(
  "/verify-forgot-password",
  validation(validators.confirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await authenticationService.verifyForgotPassword(
      req.validate.body,
    );
    return { status: 200, data };
  }),
);

router.patch(
  "/reset-forgot-password",
  validation(validators.resetForgotPasswordValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await authenticationService.resetForgotPassword(
      req.validate.body,
    );
    return { status: 200, data };
  }),
);
//=====================================================
// two step verification

router.patch(
  "/verify-two-step-verification",
  validation(validators.confirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await authenticationService.verifyTwoStepVerification(
      req.validate.body,
    );
    return { res, status: 200, data };
  }),
);

router.patch(
  "/confirm-two-step-verification",
  validation(validators.confirmEmailValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await authenticationService.confirmLogin(
      req.validate.body,
      `${req.protocol}://${req.host}`,
    );
    return { res, status: 200, data };
  }),
);
//=====================================================
// login
router.post(
  "/login",
  validation(validators.login),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<ILoginResponse | { twoStepRequired: true }>> => {
      const data = await authenticationService.login(
        req.validate.body,
        getIssuer(req),
      );
      return { status: 200, data };
    },
  ),
);
//======================================================
export default router;
