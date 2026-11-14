"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const post_repository_1 = require("./../../common/repository/post.repository");
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
class postService {
    postRepository;
    constructor() {
        this.postRepository = new post_repository_1.PostRepository();
    }
    async createPost(user, { content, files, }) {
        const post = await this.postRepository.create({
            data: {
                createdBy: user._id,
                content,
                attachments: files?.map((file) => file.path),
            },
        });
        return post;
    }
    async getAllPosts(user, { page, limit }) {
        const { docs, pages, currentPage, limit: pageSize, } = await this.postRepository.paginate({
            filter: {
                createdBy: user._id,
                isDeleted: false,
            },
            page,
            limit,
        });
        if (!docs.length) {
            throw new domain_exception_js_1.NotFoundException("No posts for you");
        }
        return {
            docs,
            pages,
            page: currentPage,
            limit: pageSize,
        };
    }
    async getSinglePost(postId) {
        const existPost = await this.postRepository.findById({
            id: postId,
        });
        if (!existPost) {
            throw new domain_exception_js_1.NotFoundException("this post not found");
        }
        return existPost;
    }
    async update(user, data, postId) {
        const post = await this.postRepository.findById({
            id: postId,
        });
        if (!post || post.isDeleted) {
            throw new domain_exception_js_1.NotFoundException("Post not found");
        }
        if (!post.createdBy.equals(user._id)) {
            throw new domain_exception_js_1.ForbiddenRequestException("You are not allowed to update");
        }
        const updatedPost = await this.postRepository.findByIdUpdate({
            id: postId,
            update: { $set: data },
            options: { runValidators: true },
        });
        if (!updatedPost) {
            throw new domain_exception_js_1.NotFoundException("Post not found");
        }
        return updatedPost;
    }
    async delete(postId, user) {
        const post = await this.postRepository.findById({
            id: postId,
        });
        if (!post || post.isDeleted) {
            throw new domain_exception_js_1.NotFoundException("Post not found");
        }
        if (!post.createdBy.equals(user._id)) {
            throw new domain_exception_js_1.ForbiddenRequestException("You are not allowed to delete");
        }
        const data = await this.postRepository.deleteOne({
            filter: { createdBy: user._id, _id: postId },
        });
        if (!data.deletedCount) {
            throw new domain_exception_js_1.NotFoundException("invalid message id");
        }
        return data;
    }
}
exports.postService = postService;
exports.default = new postService();
