"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestException = exports.ForbiddenRequestException = exports.UnauthorizedException = exports.NotFoundException = exports.ConflictRequestException = exports.BadRequestException = void 0;
const main_exception_js_1 = require("./main.exception.js");
class BadRequestException extends main_exception_js_1.ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class ConflictRequestException extends main_exception_js_1.ApplicationException {
    constructor(message = "ConflictRequest", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictRequestException = ConflictRequestException;
class NotFoundException extends main_exception_js_1.ApplicationException {
    constructor(message = "NotFound", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends main_exception_js_1.ApplicationException {
    constructor(message = "Unauthorized", cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenRequestException extends main_exception_js_1.ApplicationException {
    constructor(message = "ForbiddenRequest", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenRequestException = ForbiddenRequestException;
class TooManyRequestException extends main_exception_js_1.ApplicationException {
    constructor(message = "TooManyRequest", cause) {
        super(message, 429, cause);
    }
}
exports.TooManyRequestException = TooManyRequestException;
