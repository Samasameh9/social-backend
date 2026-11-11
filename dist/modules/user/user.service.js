"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const cloud_service_1 = require("./../../common/service/cloud.service");
const security_enum_js_1 = require("../../common/enum/security.enum.js");
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
const user_repository_js_1 = require("../../common/repository/user.repository.js");
const cashe_service_js_1 = require("../../common/service/cashe.service.js");
const token_service_js_1 = require("../../common/service/token.service.js");
const objectId_js_1 = require("../../common/utilis/objectId.js");
const config_js_1 = require("../../config.js");
class UserService {
    userRepository;
    cachService;
    tokenService;
    cloudService;
    constructor() {
        this.cachService = cashe_service_js_1.cachService;
        this.userRepository = new user_repository_js_1.UserRepository();
        this.tokenService = token_service_js_1.tokenService;
        this.cloudService = cloud_service_1.cloudService;
    }
    async rotateToken(payload, user, issuer) {
        const accessExpiresIn = (payload.iat + config_js_1.ACCESS_TOKEN_EXPIREIN) * 1000;
        const currentTime = Date.now() + 30 * 60000;
        if (currentTime < accessExpiresIn) {
            throw new domain_exception_js_1.ConflictRequestException("sorry we cannot create new login now");
        }
        const data = await this.tokenService.createLoginCredentials({
            user,
            issuer,
        });
        await this.tokenService.createRevokeToken({ payload });
        return data;
    }
    async clearProfileCache(userId) {
        return await this.cachService.del({
            key: this.tokenService.userBaseKey({ userId }),
        });
    }
    async profileImage(file, user) {
        const key = await this.cloudService.uploadAssets({
            file,
            folder: `${user._id.toString()}`,
        });
        return key;
    }
    async profile(account) {
        const cachedProfile = await this.cachService.get({
            key: this.tokenService.userBaseKey({ userId: account._id }),
        });
        if (cachedProfile) {
            return cachedProfile;
        }
        await this.cachService.set({
            key: this.tokenService.userBaseKey({ userId: account._id }),
            value: account,
            ttl: 300,
        });
        return account;
    }
    async update(user, data) {
        const account = await this.userRepository.findByIdUpdate({
            update: data,
            id: user._id,
        });
        await this.clearProfileCache(user.id);
        return account;
    }
    async followUnFollow(userId, currentUserId, action) {
        if (userId === currentUserId) {
            throw new domain_exception_js_1.BadRequestException("You cannot follow yourself");
        }
        const currentUser = await this.userRepository.findById({
            id: (0, objectId_js_1.toObjectId)(currentUserId),
        });
        if (!currentUser) {
            throw new domain_exception_js_1.NotFoundException("Current user does not exist");
        }
        if (action === 1) {
            await this.userRepository.findByIdUpdate({
                id: (0, objectId_js_1.toObjectId)(userId),
                update: {
                    $addToSet: {
                        followers: currentUserId,
                    },
                },
            });
            await this.userRepository.findByIdUpdate({
                id: (0, objectId_js_1.toObjectId)(currentUserId),
                update: {
                    $addToSet: {
                        following: userId,
                    },
                },
            });
        }
        else {
            await this.userRepository.findByIdUpdate({
                id: (0, objectId_js_1.toObjectId)(userId),
                update: {
                    $pull: {
                        followers: currentUserId,
                    },
                },
            });
            await this.userRepository.findByIdUpdate({
                id: (0, objectId_js_1.toObjectId)(currentUserId),
                update: {
                    $pull: {
                        following: userId,
                    },
                },
            });
        }
        const account = await this.userRepository.findById({
            id: (0, objectId_js_1.toObjectId)(currentUserId),
        });
        return account;
    }
    async search(keyword, page, limit) {
        const accounts = await this.userRepository.paginate({
            filter: {
                firstName: { $regex: keyword, $options: "i" },
            },
            page,
            limit,
        });
        return accounts;
    }
    async suggestions(userId, page, limit) {
        const currentUser = await this.userRepository.findById({
            id: (0, objectId_js_1.toObjectId)(userId),
        });
        const followedUsers = await this.userRepository.find({
            filter: {
                _id: { $in: currentUser.following },
            },
        });
        const suggestedIds = followedUsers.flatMap((user) => user.following);
        const uniqueIds = [...new Set(suggestedIds)].filter((id) => id !== userId && !currentUser.following.includes(id));
        const accounts = await this.userRepository.paginate({
            filter: {
                _id: { $in: uniqueIds },
            },
            page,
            limit,
        });
        return accounts;
    }
    async updatePrivacy(userId, privacy) {
        await this.userRepository.updateOne({
            filter: { _id: (0, objectId_js_1.toObjectId)(userId) },
            update: { privacy },
        });
        return;
    }
    async logout(payload, user, { action = security_enum_js_1.LogoutEnum.DEVICE }) {
        switch (action) {
            case security_enum_js_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cachService.del({
                    key: await this.cachService.keys({
                        prefix: this.tokenService.userBaseRevokeTokenKey({
                            userId: payload.sub,
                        }),
                    }),
                });
                break;
            default:
                await this.tokenService.createRevokeToken({ payload });
                break;
        }
        return;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
