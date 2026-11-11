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

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly cachService: CachService;
  private readonly tokenService: TokenService;
  private readonly cloudService: CloudService;

  constructor() {
    this.cachService = cachService;
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
  async profileImage(file: IFile, user: HUser): Promise<string> {
    const key = await this.cloudService.uploadAssets({
      file,
      folder: `${user._id.toString()}`,
    });
    return key;
  }
  //===================================
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
  async followUnFollow(
    userId: string,
    currentUserId: string,
    action: 0 | 1,
  ): Promise<IUser> {
    if (userId === currentUserId) {
      throw new BadRequestException("You cannot follow yourself");
    }
    const currentUser = await this.userRepository.findById({
      id: toObjectId(currentUserId),
    });
    if (!currentUser) {
      throw new NotFoundException("Current user does not exist");
    }
    if (action === 1) {
      // follow
      await this.userRepository.findByIdUpdate({
        id: toObjectId(userId),
        update: {
          $addToSet: {
            followers: currentUserId,
          },
        },
      });

      await this.userRepository.findByIdUpdate({
        id: toObjectId(currentUserId),
        update: {
          $addToSet: {
            following: userId,
          },
        },
      });
    } else {
      // unfollow
      await this.userRepository.findByIdUpdate({
        id: toObjectId(userId),
        update: {
          $pull: {
            followers: currentUserId,
          },
        },
      });

      await this.userRepository.findByIdUpdate({
        id: toObjectId(currentUserId),
        update: {
          $pull: {
            following: userId,
          },
        },
      });
    }
    const account = await this.userRepository.findById({
      id: toObjectId(currentUserId),
    });
    return account as IUser;
  }
  //=================================================
  // search
  async search(keyword: string, page: number, limit: number) {
    const accounts = await this.userRepository.paginate({
      filter: {
        firstName: { $regex: keyword, $options: "i" } as unknown as String,
      },
      page,
      limit,
    });

    return accounts;
  }
  //==================================================
  // suggestions
  async suggestions(userId: string, page: number, limit: number) {
    const currentUser = await this.userRepository.findById({
      id: toObjectId(userId),
    });

    const followedUsers = await this.userRepository.find({
      filter: {
        _id: { $in: currentUser!.following },
      },
    });

    const suggestedIds = followedUsers.flatMap((user) => user.following);

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
