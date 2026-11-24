import {
  NextFunction,
  Request,
  Response,
  Router,
  type Router as RouterType,
} from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { responseFormatter } from "../../middleware/response.middleware.js";
import { IPost } from "../../common/interface/post.interface.js";
import { IResponse } from "../../common/interface/response.interface.js";
import postService from "./post.service.js";
import * as validators from "./post.validation";
import { validation } from "../../middleware/validation.middleware.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";
import {
  FileValidation,
  localFileUpload,
} from "../../common/utilis/multer/local.multer.js";
import { StorageApproachEnum } from "../../common/enum/multer.enum.js";
import mongoose from "mongoose";
import { IFile } from "../../common/types/multer.type.js";
import { UpdatePostDto } from "./dto/post.dto.js";

const router: RouterType = Router({ strict: true, caseSensitive: true });

// create post
router.post(
  "/",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      storageApproach: StorageApproachEnum.MEMORY,
    }).array("attachments"),
    validation: FileValidation.image,
    customPath: "Post",
    isRequired: false,
  }),
  validation(validators.createPost),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<IPost>> => {
      const data = await postService.createPost(
        req.user,
        req.validate.body,
        req.files as IFile[],
      );
      return { status: 201, data };
    },
  ),
);
//==================================
// get all posts
router.get(
  "/all-posts",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await postService.getAllPosts(req.user, { page, limit });
    return { status: 200, data };
  }),
);
//====================================
//get single post
router.get(
  "/:postId",
  authentication(),
  validation(validators.posIdValidation),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<IPost | null | undefined>> => {
      const data = await postService.getSinglePost(
        req.validate.params.postId as unknown as mongoose.Types.ObjectId,
      );
      return { status: 200, data };
    },
  ),
);
//=======================================
//update post
router.patch(
  "/:postId",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      storageApproach: StorageApproachEnum.MEMORY,
    }).array("attachments"),
    validation: FileValidation.image,
    customPath: "Post",
    isRequired: false,
  }),
  validation(validators.update),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await postService.update(
      req.user,
      req.validate.body,
      req.files as IFile[],
      req.params as UpdatePostDto['params'],
    );
    return { res, data };
  }),
);
//====================================
// delete post
router.delete(
  "/:postId",
  authentication(),
  validation(validators.posIdValidation),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await postService.delete(
      req.validate.params.postId as unknown as mongoose.Types.ObjectId,
      req.user,
    );
    return { res, data };
  }),
);
export default router;
