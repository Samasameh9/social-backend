import mongoose from "mongoose";
import { HUser } from "../../DB/model/user.model.js";
import { HPost } from "./../../DB/model/post.model";
import { IPost } from "./../../common/interface/post.interface";
import { PostRepository } from "./../../common/repository/post.repository";
import {
  BadRequestException,
  ForbiddenRequestException,
  NotFoundException,
} from "../../common/exception/domain.exception.js";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto.js";
import { IFile } from "../../common/types/multer.type.js";
import { UserRepository } from "../../common/repository/user.repository.js";
import {
  cloudService,
  CloudService,
} from "../../common/service/cloud.service.js";
import { createNumberOtp } from "../../common/utilis/email/otp.js";
import { toObjectId } from "../../common/utilis/objectId.js";

export class postService {
  private readonly postRepository: PostRepository;
  private readonly userRepository: UserRepository;
  private readonly cloudService: CloudService;

  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
    this.cloudService = cloudService;
  }

  // create post
  async createPost(
    user: HUser,
    { content, privacy, mentions, allowShare }: CreatePostDto["body"],
    files: IFile[],
  ): Promise<IPost> {
    const folderId = createNumberOtp();
    let attachments: string[] = [];
    if (
      mentions?.length &&
      (
        await this.userRepository.find({
          filter: { _id: { $in: mentions } },
        })
      ).length != mentions.length
    ) {
      throw new NotFoundException("some of mentioned account not exist");
    }
    if (files?.length) {
      attachments = await this.cloudService.uploadAssets({
        files,
        folder: `post/${folderId}`,
      });
    }
    const post = await this.postRepository.create({
      data: {
        folderId,
        createdBy: user._id,
        content,
        attachments,
        privacy,
        mentions,
        allowShare,
      },
    });
    return post;
  }
  //==================================
  // get all posts
  async getAllPosts(
    user: HUser,
    { page, limit }: { page: number; limit: number },
  ) {
    const {
      docs,
      pages,
      currentPage,
      limit: pageSize,
    } = await this.postRepository.paginate({
      filter: {
        createdBy: user._id,
        isDeleted: false,
      },
      page,
      limit,
    });

    if (!docs.length) {
      throw new NotFoundException("No posts for you");
    }

    return {
      docs,
      pages,
      page: currentPage,
      limit: pageSize,
    };
  }
  //====================================
  //get single post
  async getSinglePost(
    postId: mongoose.Types.ObjectId,
  ): Promise<IPost | null | undefined> {
    const existPost = await this.postRepository.findById({
      id: postId,
    });
    if (!existPost) {
      throw new NotFoundException("this post not found");
    }
    return existPost;
  }
  //=======================================
  //update post
  async update(
    user: HUser,
    {
      allowShare,
      removeAttachments = [],
      removeMention = [],
      mentions = [],
      privacy,
      content,
    }: UpdatePostDto["body"],
    files: IFile[] = [],
    { postId }: UpdatePostDto["params"],
  ): Promise<IPost> {
    if (
      mentions?.length &&
      (
        await this.userRepository.find({
          filter: { _id: { $in: mentions } },
        })
      ).length != mentions.length
    ) {
      throw new NotFoundException("some of mentioned account not exist");
    }
    const post = await this.postRepository.findOne({
      filter: { _id: postId },
    });
    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }
    if (!post.createdBy.equals(user._id)) {
      throw new ForbiddenRequestException("You are not allowed to update");
    }
    removeAttachments = removeAttachments.filter((ele) =>
      post.attachments?.includes(ele),
    );
    const postAttachmentsLength =
      post.attachments?.length! + files.length - removeAttachments.length;
    if (postAttachmentsLength > 3) {
      throw new BadRequestException("post cannot hold more than 3 files");
    }
    const postContent = content ?? post.content;
    if (!postContent?.length && postAttachmentsLength < 1) {
      throw new BadRequestException("post cannot be empty");
    }
    let newAttachments: string[] = [];
    if (files.length) {
      newAttachments = await this.cloudService.uploadAssets({
        files,
        folder: `post/${post.folderId}`,
      });
    }
    const updatedPost = await this.postRepository.findOneUpdate({
      filter: { _id: postId, createdBy: user._id },
      update: [
        {
          $set: {
            content: postContent,
            allowShare: allowShare ?? post.allowShare,
            privacy: privacy ?? post.privacy,
            mentions: {
              $setUnion: [
                {
                  $setDifference: [
                    "$mentions",
                    removeMention.map((ele) => toObjectId(ele)),
                  ],
                },
                mentions.map((ele) => toObjectId(ele)),
              ],
            },
            attachments: {
              $setUnion: [
                {
                  $setDifference: ["$attachments", removeAttachments],
                },
                newAttachments,
              ],
            },
          },
        },
      ],
    });
    if (!updatedPost) {
      if (newAttachments?.length) {
        await this.cloudService.deleteAssets({ Keys: newAttachments });
      }
      if (removeAttachments?.length) {
        await this.cloudService.deleteAssets({ Keys: removeAttachments });
      }
      throw new NotFoundException("invalid post");
    }
    return updatedPost;
  }
  //====================================
  // delete post
  async delete(postId: mongoose.Types.ObjectId, user: HUser) {
    const post = await this.postRepository.findById({
      id: postId,
    });
    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }
    if (!post.createdBy.equals(user._id)) {
      throw new ForbiddenRequestException("You are not allowed to delete");
    }
    const data = await this.postRepository.deleteOne({
      filter: { createdBy: user._id, _id: postId },
    });
    if (!data.deletedCount) {
      throw new NotFoundException("invalid message id");
    }
    return data;
  }
}

export default new postService();
