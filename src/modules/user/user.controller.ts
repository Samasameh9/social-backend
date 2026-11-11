import { NextFunction, Request, Response, Router } from "express";
import {
  authentication,
  authorization,
  responseFormatter,
  uploadMiddleware,
  validation,
} from "../../middleware";
import { TokenTypeEnum } from "../../common/enum/security.enum.js";
import { userService } from "./user.service.js";
import { getIssuer } from "../../common/utilis/issuer.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import * as validators from "./user.validation";
import {
  FileValidation,
  localFileUpload,
} from "../../common/utilis/multer/local.multer.js";
import { StorageApproachEnum } from "../../common/enum/multer.enum.js";
import { IFile } from "../../common/types/multer.type.js";
import { IResponse } from "../../common/interface/response.interface.js";

const router = Router({ caseSensitive: true, strict: true });
// profile
router.get(
  "/",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.profile(req.user);
    return { data };
  }),
);
//=============================================
//update
router.patch(
  "/",
  authentication(),
  authorization(RoleEnum.ADMIN),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.update(req.user, req.body);
    return { res, data };
  }),
);
//=================================================
// rotate token
router.post(
  "/rotate-token",
  authentication(TokenTypeEnum.REFRESH),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.rotateToken(
      req.payload,
      req.user,
      getIssuer(req),
    );
    return { res, data };
  }),
);
//=================================================
// follow unfollow
router.post(
  "/follow-unfollow",
  validation(validators.followUnfollowSchema),
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.followUnFollow(
      req.validate.body.userId,
      req.user._id.toString(),
      req.validate.body.action,
    );
    return { res, data };
  }),
);
//==================================================
// search
router.get(
  "/search",
  authentication(),
  validation(validators.searchUsersSchema),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.search(
      req.validate.query.keyword,
      req.validate.query.page,
      req.validate.query.limit,
    );
    return { res, data };
  }),
);
//===================================================
// suggestions
router.get(
  "/suggestions",
  authentication(),
  validation(validators.suggestionsUsersSchema),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.suggestions(
      req.user.id,
      req.validate.query.page,
      req.validate.query.limit,
    );
    return { res, data };
  }),
);
//===================================================
// upload profile image
router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      storageApproach: StorageApproachEnum.MEMORY,
    }).single("attachment"),
    validation: FileValidation.image,
    customPath: "User",
  }),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<Record<string, string>>> => {
      const key = await userService.profileImage(req.file as IFile, req.user);
      return { data: { key } };
    },
  ),
);
//===================================================
// update privacy
router.patch(
  "/privacy",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.updatePrivacy(req.user.id, req.body.privacy);
    return { res, data };
  }),
);
//==================================================
// logout
router.post(
  "/logout",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.logout(req.payload, req.user, req.body);
    return { res, data };
  }),
);

export default router;
