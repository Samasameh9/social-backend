"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseFormatter = void 0;
const responseFormatter = (handler) => {
    return async (req, res, next) => {
        const { message = true, status = 200, data = undefined, meta = undefined, } = (await handler(req, res, next)) ?? {};
        if (res.headersSent) {
            return;
        }
        return res.status(status).json({
            message: message,
            data: data,
            meta: meta,
        });
    };
};
exports.responseFormatter = responseFormatter;
