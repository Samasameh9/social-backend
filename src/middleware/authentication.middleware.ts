import { tokenService } from "./../common/service/token.service";
import { RoleEnum } from "./../common/enum/user.enum";
import {
  ForbiddenRequestException,
  UnauthorizedException,
} from "./../common/exception/domain.exception";
import { TokenTypeEnum } from "./../common/enum/security.enum";
import { NextFunction, Request, Response } from "express";

export const bearerAuth = async ({
  req,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  req: Request;
  tokenType: TokenTypeEnum;
}) => {
  const [key, credentials] = (req.headers["authorization"]?.split(" ") ||
    []) as [string, string];
  const { user, payload } = await tokenService.decodeToken({
    authorization: credentials,
    tokenType,
  });
  req.user = user;
  req.payload = payload;
};

export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException("unauthorization account");
    }
    const [key, credentials] = (authorization?.split(" ") || []) as [
      string,
      string,
    ];
    switch (key) {
      case "Basic":
        const [email, password] = Buffer.from(credentials, "base64")
          .toString()
          .split(":");
        if (!email || !password) {
          throw new UnauthorizedException("Invalid basic credentials");
        }
        req.user = await tokenService.basicAuth({ email, password });

        break;
      case "Bearer":
        await bearerAuth({ req, tokenType });
        break;

      default:
        break;
    }

    next();
  };
};

export const authorization = (accessRole: RoleEnum) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role < accessRole) {
      throw new ForbiddenRequestException("Forbidden account");
    }

    next();
  };
};
