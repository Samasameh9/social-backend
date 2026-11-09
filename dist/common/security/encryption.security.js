"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryption = exports.encryption = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_js_1 = require("../../config.js");
const encryption = async (plaintext) => {
    const iv = node_crypto_1.default.randomBytes(config_js_1.IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", config_js_1.ENC_KEY, iv);
    let encryptedData = cipher.update(plaintext, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return `${iv.toString("hex")}::${encryptedData}`;
};
exports.encryption = encryption;
const decryption = async (ciphertext) => {
    const [iv, encryptedData] = ciphertext.split("::");
    const iv_vector = Buffer.from(iv, "hex");
    const decryptedVector = node_crypto_1.default.createDecipheriv("aes-256-cbc", config_js_1.ENC_KEY, iv_vector);
    let plaintext = decryptedVector.update(encryptedData, "hex", "utf-8");
    plaintext += decryptedVector.final("utf-8");
    return plaintext;
};
exports.decryption = decryption;
