"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = exports.bearerAuth = void 0;
const token_service_1 = require("./../common/service/token.service");
const domain_exception_1 = require("./../common/exception/domain.exception");
const security_enum_1 = require("./../common/enum/security.enum");
const bearerAuth = async ({ req, tokenType = security_enum_1.TokenTypeEnum.ACCESS, }) => {
    const [key, credentials] = (req.headers["authorization"]?.split(" ") ||
        []);
    const { user, payload } = await token_service_1.tokenService.decodeToken({
        authorization: credentials,
        tokenType,
    });
    req.user = user;
    req.payload = payload;
};
exports.bearerAuth = bearerAuth;
const authentication = (tokenType = security_enum_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new domain_exception_1.UnauthorizedException("unauthorization account");
        }
        const [key, credentials] = (authorization?.split(" ") || []);
        switch (key) {
            case "Basic":
                const [email, password] = Buffer.from(credentials, "base64")
                    .toString()
                    .split(":");
                if (!email || !password) {
                    throw new domain_exception_1.UnauthorizedException("Invalid basic credentials");
                }
                req.user = await token_service_1.tokenService.basicAuth({ email, password });
                break;
            case "Bearer":
                await (0, exports.bearerAuth)({ req, tokenType });
                break;
            default:
                break;
        }
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) {
            throw new domain_exception_1.ForbiddenRequestException("Forbidden account");
        }
        next();
    };
};
exports.authorization = authorization;
