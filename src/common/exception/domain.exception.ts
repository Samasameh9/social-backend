import { ApplicationException } from "./main.exception.js";

export class BadRequestException extends ApplicationException {
  constructor(message: string = "BadRequest", cause?: unknown) {
    super(message, 400, cause);
  }
}
export class ConflictRequestException extends ApplicationException {
  constructor(message: string = "ConflictRequest", cause?: unknown) {
    super(message, 409, cause);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(message: string = "NotFound", cause?: unknown) {
    super(message, 404, cause);
  }
}

export class UnauthorizedException extends ApplicationException {
  constructor(message: string = "Unauthorized", cause?: unknown) {
    super(message, 401, cause);
  }
}

export class ForbiddenRequestException extends ApplicationException {
  constructor(message: string = "ForbiddenRequest", cause?: unknown) {
    super(message, 403, cause);
  }
}

export class TooManyRequestException extends ApplicationException {
  constructor(message: string = "TooManyRequest", cause?: unknown) {
    super(message, 429, cause);
  }
}
