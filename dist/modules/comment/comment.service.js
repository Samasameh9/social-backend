"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = void 0;
const comment_repository_js_1 = require("../../common/repository/comment.repository.js");
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
const post_repository_js_1 = require("../../common/repository/post.repository.js");
class commentService {
    commentRepository;
    postRepository;
    constructor() {
        this.commentRepository = new comment_repository_js_1.CommentRepository();
        this.postRepository = new post_repository_js_1.PostRepository();
    }
    async createComment(user, postId, { content, files, }) {
        const existPost = await this.postRepository.findById({
            id: postId,
        });
        if (!existPost) {
            throw new domain_exception_js_1.NotFoundException("this post not found");
        }
        const comment = await this.commentRepository.create({
            data: {
                createdBy: user._id,
                postId,
                content,
                attachments: files?.map((file) => file.path),
            },
        });
        return comment;
    }
    async getAllCommentsOnPost(user, postId, { page, limit }) {
        const { docs, pages, currentPage, limit: pageSize, } = await this.commentRepository.paginate({
            filter: {
                createdBy: user._id,
                isDeleted: false,
                postId
            },
            page,
            limit,
        });
        if (!docs.length) {
            throw new domain_exception_js_1.NotFoundException("No comments on this post");
        }
        return {
            docs,
            pages,
            page: currentPage,
            limit: pageSize,
        };
    }
    async getSinglePost(commentId) {
        const existComment = await this.commentRepository.findById({
            id: commentId,
        });
        if (!existComment) {
            throw new domain_exception_js_1.NotFoundException("this comment not found");
        }
        return existComment;
    }
    async update(user, data, commentId) {
        const comment = await this.commentRepository.findById({
            id: commentId,
        });
        if (!comment || comment.isDeleted) {
            throw new domain_exception_js_1.NotFoundException("comment not found");
        }
        if (!comment.createdBy.equals(user._id)) {
            throw new domain_exception_js_1.ForbiddenRequestException("You are not allowed to update");
        }
        const updatedComment = await this.commentRepository.findByIdUpdate({
            id: commentId,
            update: { $set: data },
            options: { runValidators: true },
        });
        if (!updatedComment) {
            throw new domain_exception_js_1.NotFoundException("comment not found");
        }
        return updatedComment;
    }
    async delete(commentId, user) {
        const comment = await this.commentRepository.findById({
            id: commentId,
        });
        if (!comment || comment.isDeleted) {
            throw new domain_exception_js_1.NotFoundException("comment not found");
        }
        if (!comment.createdBy.equals(user._id)) {
            throw new domain_exception_js_1.ForbiddenRequestException("You are not allowed to delete");
        }
        const data = await this.commentRepository.deleteOne({
            filter: { createdBy: user._id, _id: commentId },
        });
        if (!data.deletedCount) {
            throw new domain_exception_js_1.NotFoundException("invalid message id");
        }
        return data;
    }
}
exports.commentService = commentService;
exports.default = new commentService();
