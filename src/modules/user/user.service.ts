import { FollowRequestRepository } from "./../../common/repository/followRequest.repository";
import {
  CloudService,
  cloudService,
} from "./../../common/service/cloud.service";
import { LogoutEnum } from "../../common/enum/security.enum.js";
import { PrivacyEnum } from "../../common/enum/user.enum.js";
import {
  BadRequestException,
  ConflictRequestException,
  NotFoundException,
} from "../../common/exception/domain.exception.js";
import { IUser } from "../../common/interface/user.interface.js";
import { UserRepository } from "../../common/repository/user.repository.js";
import {
  cachService,
  CachService,
} from "../../common/service/cashe.service.js";
import {
  jwtPayloadType,
  tokenService,
  TokenService,
} from "../../common/service/token.service.js";
import { toObjectId } from "../../common/utilis/objectId.js";
import { ACCESS_TOKEN_EXPIREIN } from "../../config.js";
import { HUser } from "../../DB/model/user.model.js";
import { ILoginResponse } from "../authentication/entities/authentication.entity.js";
import { IFile } from "../../common/types/multer.type.js";
import mongoose from "mongoose";
import { FollowRequestDto } from "./dto/user.dto.js";
import { IFollowRequest } from "../../common/interface/followRequest.interface.js";
import { FollowRequestStatusEnum } from "../../common/enum/followRequest.enum.js";

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly followRequestRepository: FollowRequestRepository;
  private readonly cachService: CachService;
  private readonly tokenService: TokenService;
  private readonly cloudService: CloudService;

  constructor() {
    this.cachService = cachService;
    this.followRequestRepository = new FollowRequestRepository();
    this.userRepository = new UserRepository();
    this.tokenService = tokenService;
    this.cloudService = cloudService;
  }
  // rotate token
  async rotateToken(
    payload: jwtPayloadType,
    user: HUser,
    issuer: string,
  ): Promise<ILoginResponse> {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIREIN) * 1000;
    const currentTime = Date.now() + 30 * 60000;
    if (currentTime < accessExpiresIn) {
      throw new ConflictRequestException(
        "sorry we cannot create new login now",
      );
    }
    const data = await this.tokenService.createLoginCredentials({
      user,
      issuer,
    });
    await this.tokenService.createRevokeToken({ payload });
    return data;
  }
  //=================================
  async clearProfileCache(userId: string): Promise<number> {
    return await this.cachService.del({
      key: this.tokenService.userBaseKey({ userId }),
    });
  }
  //====================================
  // profile image
  // async profileImage(file: IFile, user: HUser): Promise<IUser> {
  //   const oldImg = user.image;
  //   const { Key } = await this.cloudService.uploadLargeAsset({
  //     file,
  //     folder: `${user._id.toString()}`,
  //   });
  //   user.image = Key as string;
  //   await user.save();
  //   if (oldImg?.length) {
  //     await this.cloudService.deleteAsset({ Key: oldImg as string });
  //   }
  //   return user.toJSON();
  // }
  //===================================
  // profile image with pre sined url and lambda

  async profileImage(
    {
      ContentType,
      Originalname,
    }: { ContentType: string; Originalname: string },
    user: HUser,
  ): Promise<string> {
    const { Key, url } = await this.cloudService.createPreSignedUploadAssetLink(
      {
        ContentType,
        Originalname,
        folder: `${user._id.toString()}`,
      },
    );
    // user.image = Key as string;
    // await user.save();
    return url;
  }
  //====================================
  // cover image
  async profileCoverImage(files: IFile[], user: HUser): Promise<IUser> {
    const oldCoverImg = user.coverImage || [];

    user.coverImage = await this.cloudService.uploadAssets({
      files,
      folder: `${user._id.toString()}`,
    });
    await user.save();
    if (oldCoverImg?.length) {
      await this.cloudService.deleteAssets({ Keys: oldCoverImg as string[] });
    }
    return user.toJSON();
  }
  //=====================================
  // delete profile image
  async deleteProfileImage(file: IFile, user: HUser): Promise<IUser> {
    const oldImg = user.image;
    user.image = await this.cloudService.uploadAsset({
      file,
      folder: `${user._id.toString()}`,
    });
    await user.save();
    if (oldImg?.length) {
      await this.cloudService.deleteAsset({ Key: oldImg as string });
    }
    await this.cloudService.deleteFolderByPrefix({
      Prefix: `${user._id.toString()}`,
    });

    return user.toJSON();
  }

  //======================================
  // profile
  async profile(account: HUser): Promise<HUser> {
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
  //===================================================
  //  update
  async update(user: HUser, data: Partial<IUser>): Promise<HUser | null> {
    const account = await this.userRepository.findByIdUpdate({
      update: data,
      id: user._id,
    });
    await this.clearProfileCache(user.id);
    return account;
  }
  //=================================================
  // follow unfollow
  async followRequest(
    { receiverId, note }: FollowRequestDto,
    user: HUser,
  ): Promise<IFollowRequest> {
    const checkReceiver = await this.userRepository.findById({
      id: toObjectId(receiverId),
    });
    if (!checkReceiver) {
      throw new NotFoundException("receiver id not found");
    }
    const checkRequestDuplication = await this.followRequestRepository.findOne({
      filter: {
        senderId: { $in: [user._id, receiverId] },
        receiverId: { $in: [user._id, receiverId] },
      },
    });
    if (checkRequestDuplication) {
      throw new ConflictRequestException("Request already exists");
    }

    const request = await this.followRequestRepository.create({
      data: {
        senderId: user._id,
        receiverId,
        note,
      },
    });
    return request.toJSON();
  }
  //=================================================
  // follow unfollow
  async followUnFollow(
    userId: string,
    currentUserId: string,
    action: 0 | 1,
    followRequestId: string,
  ): Promise<IUser> {
    if (userId === currentUserId) {
      throw new BadRequestException("You cannot follow yourself");
    }

    if (action === 1) {
      // follow
      const request = await this.followRequestRepository.findOneUpdate({
        filter: {
          _id: followRequestId,
          status: FollowRequestStatusEnum.PENDING,
          receiverId: userId,
        },
        update: {
          status: FollowRequestStatusEnum.ACCEPTED,
        },
      });
      if (!request) {
        throw new NotFoundException("invalid request");
      }

      await Promise.all([
        this.userRepository.updateOne({
          filter: { _id: currentUserId },
          update: {
            $addToSet: {
              following: userId,
            },
          },
        }),
        this.userRepository.updateOne({
          filter: { _id: userId },
          update: {
            $addToSet: {
              followers: currentUserId,
            },
          },
        }),
      ]);
    } else {
      // unfollow
      await Promise.all([
        this.userRepository.updateOne({
          filter: { _id: currentUserId },
          update: {
            $pull: {
              following: userId,
            },
          },
        }),
        this.userRepository.updateOne({
          filter: { _id: userId },
          update: {
            $pull: {
              followers: currentUserId,
            },
          },
        }),
      ]);
    }
    const account = await this.userRepository.findById({
      id: toObjectId(currentUserId),
    });
    return account as IUser;
  }
  //=================================================
  // cancel follow
  async cancelFollowRequest(
    userId: string,
    currentUserId: string,
    followRequestId: string,
  ): Promise<IFollowRequest> {
    const request = await this.followRequestRepository.findOneDelete({
      filter: {
        _id: followRequestId,
        status: FollowRequestStatusEnum.PENDING,
        $Or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      },
    });
    if (!request) {
      throw new NotFoundException("invalid request");
    }
    return request.toJSON();
  }
  //=================================================
  // search
  async search(keyword: string, page: number, limit: number) {
    const accounts = await this.userRepository.paginate({
      filter: {
        firstName: { $regex: keyword, $options: "i" } as unknown as string,
      },
      page,
      limit,
    });

    return accounts;
  }
  //==================================================
  // suggestions
  async suggestions(
    userId: mongoose.Types.ObjectId,
    page: number,
    limit: number,
  ) {
    const currentUser = await this.userRepository.findById({
      id: userId,
    });

    const followedUsers = await this.userRepository.find({
      filter: {
        _id: { $in: currentUser!.following },
      },
    });

    const suggestedIds = followedUsers.flatMap(
      (user) => user.following as unknown as mongoose.Types.ObjectId,
    );

    const uniqueIds = [...new Set(suggestedIds)].filter(
      (id) => id !== userId && !currentUser!.following.includes(id),
    );
    const accounts = await this.userRepository.paginate({
      filter: {
        _id: { $in: uniqueIds },
      },
      page,
      limit,
    });
    return accounts;
  }
  //==================================================
  // privacy
  async updatePrivacy(userId: string, privacy: PrivacyEnum) {
    await this.userRepository.updateOne({
      filter: { _id: toObjectId(userId) },
      update: { privacy },
    });
    return;
  }
  //==================================================
  // logout
  async logout(
    payload: jwtPayloadType,
    user: HUser,
    { action = LogoutEnum.DEVICE }: { action: LogoutEnum },
  ) {
    switch (action) {
      case LogoutEnum.ALL:
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

export const userService = new UserService();
