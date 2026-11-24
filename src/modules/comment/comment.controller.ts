import {
  NextFunction,
  Request,
  Response,
  Router,
  type Router as RouterType,
} from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import {
  FileValidation,
  localFileUpload,
} from "../../common/utilis/multer/local.multer.js";
import { StorageApproachEnum } from "../../common/enum/multer.enum.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";
import { responseFormatter } from "../../middleware/response.middleware.js";
import { IResponse } from "../../common/interface/response.interface.js";
import { IComment } from "../../common/interface/comment.interface.js";
import commentService from "./comment.service.js";
import { HComment } from "../../DB/model/comment.model.js";
import mongoose from "mongoose";
import * as validators from "./comment.validation";
import { validation } from "../../middleware/validation.middleware.js";



const router: RouterType = Router({ strict: true, caseSensitive: true });

// create comment
router.post(
  "/:postId",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      storageApproach: StorageApproachEnum.MEMORY,
    }).array("attachments"),
    validation: FileValidation.image,
    customPath: "Comment",
  }),
  validation(validators.createCommentValidation),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<IComment>> => {
      const { content } = req.validate.body ;

      const data = await commentService.createComment(
        req.user ,
        req.params.postId as unknown as mongoose.Types.ObjectId,
        {
          content,
          files: req.files as Express.Multer.File[],
        },
      );
     
      return { status: 201, data };
    },
  ),
);
//=======================================
// get comments on specific post
router.get(
  "/all-comments-on-post/:postId",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await commentService.getAllCommentsOnPost(req.user,req.params.postId as unknown as mongoose.Types.ObjectId, { page, limit });
    return { status: 200, data };
  }),
);
//====================================
// get single comment by id
router.get(
  "/:commentId",
  authentication(),
  responseFormatter(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<IResponse<IComment | null | undefined>> => {
      const data = await commentService.getSinglePost(
        req.params.commentId as unknown as mongoose.Types.ObjectId,
      );
      return { status: 200, data };
    },
  ),
);
//================================
// update comment
router.patch(
  "/:commentId",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await commentService.update(
      req.user,
      req.body,
      req.params.commentId as unknown as mongoose.Types.ObjectId,
    );
    return { res, data };
  }),
);
//=================================
// delete comment
router.delete(
  "/:commentId",
  authentication(),
  responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
    const data = await commentService.delete(
      req.params.commentId as unknown as mongoose.Types.ObjectId,
      req.user,
    );
    return { res, data };
  }),
);
export default router;
