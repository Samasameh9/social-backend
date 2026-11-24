import { HUser, UserModel } from "./../../DB/model/user.model";
import { cachService, CachService } from "./cashe.service";
import { UserRepository } from "../repository/user.repository.js";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIREIN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIREIN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config.js";
import { RoleEnum } from "../enum/user.enum.js";
import { TokenTypeEnum } from "../enum/security.enum.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../exception/domain.exception.js";
import { toObjectId } from "../utilis/objectId.js";
import { randomUUID } from "node:crypto";
import { compare } from "../security/hash.security";
import { decryption } from "../security/encryption.security";

type userIdType = mongoose.Types.ObjectId | string;
export type jwtPayloadType = JwtPayload & {
  sub: userIdType;
  audience: number[];
  jti: string;
  exp: string;
  iat: number;
};

export class TokenService {
  private readonly userRepository: UserRepository;
  private readonly cachService: CachService;
  constructor() {
    this.userRepository = new UserRepository();
    this.cachService = cachService;
  }

  userBaseKey({ userId }: { userId: userIdType }): string {
    return `User::${userId.toString()}`;
  }
  userEmailBaseKey({ email }: { email: string }): string {
    return `User::${email}`;
  }

  userBaseRevokeTokenKey({ userId }: { userId: userIdType }): string {
    return `${this.userBaseKey({ userId })}::revokeToken`;
  }

  userRevokeTokenKey({
    userId,
    jti,
  }: {
    userId: userIdType;
    jti: string;
  }): string {
    return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
  }

  async createToken({
    payload,
    options,
    secret = ACCESS_USER_TOKEN_SIGNATURE,
  }: {
    payload: string | object | Buffer;
    secret: Secret;
    options?: SignOptions;
  }): Promise<String> {
    return jwt.sign(payload, secret, options);
  }

  async verifyToken({
    token,
    secret = ACCESS_USER_TOKEN_SIGNATURE,
  }: {
    token: string;
    secret: Secret;
  }): Promise<jwtPayloadType> {
    return jwt.verify(token, secret) as jwtPayloadType;
  }

  async getTokenSignature({
    role = RoleEnum.USER,
  }: {
    role: RoleEnum;
  }): Promise<{ accessSignature: string; refreshSignature: string }> {
    let signatures: { accessSignature: string; refreshSignature: string };
    switch (role) {
      case RoleEnum.ADMIN:
        signatures = {
          accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
          refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE,
        };
        break;

      default:
        signatures = {
          accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
          refreshSignature: REFRESH_USER_TOKEN_SIGNATURE,
        };

        break;
    }

    return signatures;
  }

  async getSignature({
    tokenType = TokenTypeEnum.ACCESS,
    role = RoleEnum.USER,
  }: {
    tokenType: TokenTypeEnum;
    role?: RoleEnum;
  }): Promise<String> {
    const signatures = await this.getTokenSignature({ role });
    return tokenType == TokenTypeEnum.ACCESS
      ? signatures.accessSignature
      : signatures.refreshSignature;
  }

  async decodeToken({
    authorization,
    tokenType = TokenTypeEnum.ACCESS,
  }: {
    authorization: string;
    tokenType: TokenTypeEnum;
  }): Promise<{ user: HUser; payload: jwtPayloadType }> {
    const decoded = jwt.decode(authorization) as jwtPayloadType;

    if (!decoded?.aud?.length) {
      throw new BadRequestException("missing token payload");
    }

    const payload = await this.verifyToken({
      token: authorization,
      secret: (await this.getSignature({
        tokenType,
        role: decoded.aud[0] as unknown as RoleEnum,
      })) as string,
    });
    if (!payload?.sub) {
      throw new BadRequestException("missing token payload");
    }
    if (
      await this.cachService.exists({
        key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
      })
    ) {
      throw new UnauthorizedException("expired login credentials");
    }
    const user = await this.userRepository.findById({
      id: toObjectId(payload.sub),
    });
    if (!user) {
      throw new NotFoundException("invalid user");
    }
    if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
      throw new UnauthorizedException("expired login credentials");
    }
    return { user, payload };
  }

  async createLoginCredentials({
    user,
    options = {},
    issuer,
  }: {
    user: HUser;
    options?: SignOptions;
    issuer: string;
  }): Promise<{ access_token: String, refresh_token: String }> {
    const jwtid = randomUUID();
    const { accessSignature, refreshSignature } = await this.getTokenSignature({
      role: user.role,
    });
    const access_token = await this.createToken({
      payload: { sub: user._id },
      secret: accessSignature,
      options: {
        ...options,
        issuer,
        audience: [user.role as unknown as string],
        expiresIn: ACCESS_TOKEN_EXPIREIN,
        jwtid,
      },
    });
    const refresh_token = await this.createToken({
      payload: { sub: user._id },
      secret: refreshSignature,
      options: {
        ...options,
        issuer,
        audience: [user?.role as unknown as string],
        expiresIn: REFRESH_TOKEN_EXPIREIN,
        jwtid,
      },
    });

    return { access_token, refresh_token };
  }

  async createRevokeToken({ payload }: { payload: jwtPayloadType }) {
    const consumedTime = Math.ceil(Date.now() / 1000) - payload?.iat;
    const refreshExpiresIn = payload?.iat + REFRESH_TOKEN_EXPIREIN;
    const ttl = refreshExpiresIn - consumedTime;

    await this.cachService.set({
      key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
      value: payload.jti,
      ttl,
    });
    return;
  }

  async basicAuth({ email, password }:{email:string,password:string}) {
    const account = await this.userRepository.findOne({  filter: { email } });
    if (!account) {
      throw new NotFoundException("Invalid email or password" );
    }
    const match = await compare(password,account.password as string);
    if (!match) {
      throw new NotFoundException( "Invalid email or password" );
    }
    account.phone = await decryption(account.phone as string);

    return account;
  }
}

export const tokenService = new TokenService();
