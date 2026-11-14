import mongoose from "mongoose";
import { HUser } from "../../DB/model/user.model.js";
import { HPost } from "./../../DB/model/post.model";
import { IPost } from "./../../common/interface/post.interface";
import { PostRepository } from "./../../common/repository/post.repository";
import {
  ForbiddenRequestException,
  NotFoundException,
} from "../../common/exception/domain.exception.js";

export class postService {
  private readonly postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  // create post
  async createPost(
    user: HUser,
    {
      content,
      files,
    }: {
      content?: string|undefined;
      files?: Express.Multer.File[];
    },
  ): Promise<IPost> {
    const post = await this.postRepository.create({
      data: {
        createdBy: user._id,
        content,
        attachments: files?.map((file) => file.path!),
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
    data: Partial<IPost>,
    postId: mongoose.Types.ObjectId,
  ): Promise<HPost> {
    const post = await this.postRepository.findById({
      id: postId,
    });
    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }
    if (!post.createdBy.equals(user._id)) {
      throw new ForbiddenRequestException("You are not allowed to update");
    }
    const updatedPost = await this.postRepository.findByIdUpdate({
      id: postId,
      update: { $set: data },
      options: { runValidators: true },
    });
    if (!updatedPost) {
      throw new NotFoundException("Post not found");
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
