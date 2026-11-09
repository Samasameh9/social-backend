"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const cashe_service_1 = require("./cashe.service");
const user_repository_js_1 = require("../repository/user.repository.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../../config.js");
const user_enum_js_1 = require("../enum/user.enum.js");
const security_enum_js_1 = require("../enum/security.enum.js");
const domain_exception_js_1 = require("../exception/domain.exception.js");
const objectId_js_1 = require("../utilis/objectId.js");
const node_crypto_1 = require("node:crypto");
const hash_security_1 = require("../security/hash.security");
const encryption_security_1 = require("../security/encryption.security");
class TokenService {
    userRepository;
    cachService;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
        this.cachService = cashe_service_1.cachService;
    }
    userBaseKey({ userId }) {
        return `User::${userId.toString()}`;
    }
    userEmailBaseKey({ email }) {
        return `User::${email}`;
    }
    userBaseRevokeTokenKey({ userId }) {
        return `${this.userBaseKey({ userId })}::revokeToken`;
    }
    userRevokeTokenKey({ userId, jti, }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }
    async createToken({ payload, options, secret = config_js_1.ACCESS_USER_TOKEN_SIGNATURE, }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verifyToken({ token, secret = config_js_1.ACCESS_USER_TOKEN_SIGNATURE, }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    async getTokenSignature({ role = user_enum_js_1.RoleEnum.USER, }) {
        let signatures;
        switch (role) {
            case user_enum_js_1.RoleEnum.ADMIN:
                signatures = {
                    accessSignature: config_js_1.ACCESS_ADMIN_TOKEN_SIGNATURE,
                    refreshSignature: config_js_1.REFRESH_ADMIN_TOKEN_SIGNATURE,
                };
                break;
            default:
                signatures = {
                    accessSignature: config_js_1.ACCESS_USER_TOKEN_SIGNATURE,
                    refreshSignature: config_js_1.REFRESH_USER_TOKEN_SIGNATURE,
                };
                break;
        }
        return signatures;
    }
    async getSignature({ tokenType = security_enum_js_1.TokenTypeEnum.ACCESS, role = user_enum_js_1.RoleEnum.USER, }) {
        const signatures = await this.getTokenSignature({ role });
        return tokenType == security_enum_js_1.TokenTypeEnum.ACCESS
            ? signatures.accessSignature
            : signatures.refreshSignature;
    }
    async decodeToken({ authorization, tokenType = security_enum_js_1.TokenTypeEnum.ACCESS, }) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        if (!decoded?.aud?.length) {
            throw new domain_exception_js_1.BadRequestException("missing token payload");
        }
        const payload = await this.verifyToken({
            token: authorization,
            secret: (await this.getSignature({
                tokenType,
                role: decoded.aud[0],
            })),
        });
        if (!payload?.sub) {
            throw new domain_exception_js_1.BadRequestException("missing token payload");
        }
        if (await this.cachService.exists({
            key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
        })) {
            throw new domain_exception_js_1.UnauthorizedException("expired login credentials");
        }
        const user = await this.userRepository.findById({
            id: (0, objectId_js_1.toObjectId)(payload.sub),
        });
        if (!user) {
            throw new domain_exception_js_1.NotFoundException("invalid user");
        }
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new domain_exception_js_1.UnauthorizedException("expired login credentials");
        }
        return { user, payload };
    }
    async createLoginCredentials({ user, options = {}, issuer, }) {
        const jwtid = (0, node_crypto_1.randomUUID)();
        const { accessSignature, refreshSignature } = await this.getTokenSignature({
            role: user.role,
        });
        const access_token = await this.createToken({
            payload: { sub: user._id },
            secret: accessSignature,
            options: {
                ...options,
                issuer,
                audience: [user.role],
                expiresIn: config_js_1.ACCESS_TOKEN_EXPIREIN,
                jwtid,
            },
        });
        const refresh_token = await this.createToken({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                ...options,
                issuer,
                audience: [user?.role],
                expiresIn: config_js_1.REFRESH_TOKEN_EXPIREIN,
                jwtid,
            },
        });
        return { access_token, refresh_token };
    }
    async createRevokeToken({ payload }) {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload?.iat;
        const refreshExpiresIn = payload?.iat + config_js_1.REFRESH_TOKEN_EXPIREIN;
        const ttl = refreshExpiresIn - consumedTime;
        await this.cachService.set({
            key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
            value: payload.jti,
            ttl,
        });
        return;
    }
    async basicAuth({ email, password }) {
        const account = await this.userRepository.findOne({ filter: { email } });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("Invalid email or password");
        }
        const match = await (0, hash_security_1.compare)(password, account.password);
        if (!match) {
            throw new domain_exception_js_1.NotFoundException("Invalid email or password");
        }
        account.phone = await (0, encryption_security_1.decryption)(account.phone);
        return account;
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
