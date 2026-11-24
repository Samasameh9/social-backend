"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const post_repository_1 = require("./../../common/repository/post.repository");
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
const user_repository_js_1 = require("../../common/repository/user.repository.js");
const cloud_service_js_1 = require("../../common/service/cloud.service.js");
const otp_js_1 = require("../../common/utilis/email/otp.js");
const objectId_js_1 = require("../../common/utilis/objectId.js");
class postService {
    postRepository;
    userRepository;
    cloudService;
    constructor() {
        this.postRepository = new post_repository_1.PostRepository();
        this.userRepository = new user_repository_js_1.UserRepository();
        this.cloudService = cloud_service_js_1.cloudService;
    }
    async createPost(user, { content, privacy, mentions, allowShare }, files) {
        const folderId = (0, otp_js_1.createNumberOtp)();
        let attachments = [];
        if (mentions?.length &&
            (await this.userRepository.find({
                filter: { _id: { $in: mentions } },
            })).length != mentions.length) {
            throw new domain_exception_js_1.NotFoundException("some of mentioned account not exist");
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
    async update(user, { allowShare, removeAttachments = [], removeMention = [], mentions = [], privacy, content, }, files = [], { postId }) {
        if (mentions?.length &&
            (await this.userRepository.find({
                filter: { _id: { $in: mentions } },
            })).length != mentions.length) {
            throw new domain_exception_js_1.NotFoundException("some of mentioned account not exist");
        }
        const post = await this.postRepository.findOne({
            filter: { _id: postId },
        });
        if (!post || post.isDeleted) {
            throw new domain_exception_js_1.NotFoundException("Post not found");
        }
        if (!post.createdBy.equals(user._id)) {
            throw new domain_exception_js_1.ForbiddenRequestException("You are not allowed to update");
        }
        removeAttachments = removeAttachments.filter((ele) => post.attachments?.includes(ele));
        const postAttachmentsLength = post.attachments?.length + files.length - removeAttachments.length;
        if (postAttachmentsLength > 3) {
            throw new domain_exception_js_1.BadRequestException("post cannot hold more than 3 files");
        }
        const postContent = content ?? post.content;
        if (!postContent?.length && postAttachmentsLength < 1) {
            throw new domain_exception_js_1.BadRequestException("post cannot be empty");
        }
        let newAttachments = [];
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
                                        removeMention.map((ele) => (0, objectId_js_1.toObjectId)(ele)),
                                    ],
                                },
                                mentions.map((ele) => (0, objectId_js_1.toObjectId)(ele)),
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
            throw new domain_exception_js_1.NotFoundException("invalid post");
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
