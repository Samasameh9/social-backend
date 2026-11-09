"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNumberOtp = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const createNumberOtp = () => {
    return node_crypto_1.default
        .randomInt(100000, 1000000)
        .toString();
};
exports.createNumberOtp = createNumberOtp;
