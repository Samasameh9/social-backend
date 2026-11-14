import mongoose from "mongoose";
import { CommentRepository } from "../../common/repository/comment.repository.js";
import { HComment } from "../../DB/model/comment.model.js";
import { IComment } from "../../common/interface/comment.interface.js";
import { ForbiddenRequestException, NotFoundException } from "../../common/exception/domain.exception.js";
import { PostRepository } from "../../common/repository/post.repository.js";
import { HUser } from "../../DB/model/user.model.js";

export class commentService {
  private readonly commentRepository: CommentRepository;
  private readonly postRepository: PostRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.postRepository = new PostRepository();
  }
  // create comment
  async createComment(
    user: HUser,
    postId: mongoose.Types.ObjectId,
    {
      content,
      files,
    }: {
      content?: string | undefined;
      files?: Express.Multer.File[];
    },
  ): Promise<IComment> {
    const existPost = await this.postRepository.findById({
      id: postId,
    });
    if (!existPost) {
      throw new NotFoundException("this post not found");
    }
    
    const comment = await this.commentRepository.create({
      data: {
        createdBy: user._id,
        postId,
        content,
        attachments: files?.map((file) => file.path),
      },
    })
    return comment;
  }
  //=================================
  // get post comments
 async getAllCommentsOnPost(
    user: HUser,
    postId:mongoose.Types.ObjectId,
    { page, limit }: { page: number; limit: number },
  ) {
    const {
      docs,
      pages,
      currentPage,
      limit: pageSize,
    } = await this.commentRepository.paginate({
      filter: {
        createdBy: user._id,
        isDeleted: false,
        postId
      },
      page,
      limit,
    });

    if (!docs.length) {
      throw new NotFoundException("No comments on this post");
    }
    return {
      docs,
      pages,
      page: currentPage,
      limit: pageSize,
    };
  }
  //=====================================
  // get single comment
 async getSinglePost(
    commentId: mongoose.Types.ObjectId,
  ): Promise<IComment | null | undefined> {
    const existComment = await this.commentRepository.findById({
      id: commentId,
    });
    if (!existComment) {
      throw new NotFoundException("this comment not found");
    }
    return existComment;
  }
  //====================================
  //update comment
 async update(
    user: HUser,
    data: Partial<IComment>,
    commentId: mongoose.Types.ObjectId,
  ): Promise<HComment> {
    const comment = await this.commentRepository.findById({
      id: commentId,
    });
    if (!comment || comment.isDeleted) {
      throw new NotFoundException("comment not found");
    }
    if (!comment.createdBy.equals(user._id)) {
      throw new ForbiddenRequestException("You are not allowed to update");
    }
    const updatedComment = await this.commentRepository.findByIdUpdate({
      id: commentId,
      update: { $set: data },
      options: { runValidators: true },
    });
    if (!updatedComment) {
      throw new NotFoundException("comment not found");
    }
    return updatedComment;
  }
  //===============================
  //delete comment
   async delete(commentId: mongoose.Types.ObjectId, user: HUser) {
      const comment = await this.commentRepository.findById({
        id: commentId,
      });
      if (!comment || comment.isDeleted) {
        throw new NotFoundException("comment not found");
      }
      if (!comment.createdBy.equals(user._id)) {
        throw new ForbiddenRequestException("You are not allowed to delete");
      }
      const data = await this.commentRepository.deleteOne({
        filter: { createdBy: user._id, _id: commentId },
      });
      if (!data.deletedCount) {
        throw new NotFoundException("invalid message id");
      }
      return data;
    }
}

export default new commentService();
