"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMulterUpload = exports.processFields = exports.processFiles = exports.saveFile = exports.processFile = exports.localFileUpload = exports.FileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const file_type_1 = require("file-type");
const domain_exception_js_1 = require("../../exception/domain.exception.js");
const multer_enum_js_1 = require("../../enum/multer.enum.js");
const node_os_1 = require("node:os");
exports.FileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    files: ["application/pdf", "application/json"],
};
const localFileUpload = ({ maxFileSize = 5, storageApproach = multer_enum_js_1.StorageApproachEnum.MEMORY, }) => {
    const storage = storageApproach == multer_enum_js_1.StorageApproachEnum.MEMORY
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
            destination(req, file, callback) {
                callback(null, (0, node_os_1.tmpdir)());
            },
            filename(req, file, callback) {
                callback(null, (0, node_crypto_1.randomUUID)() + file.originalname);
            },
        });
    return (0, multer_1.default)({
        storage,
        limits: {
            fileSize: maxFileSize * 1024 * 1024,
        },
    });
};
exports.localFileUpload = localFileUpload;
const processFile = async ({ file, validation = [], }) => {
    if (file.path) {
        file.buffer = await (0, promises_1.readFile)(file.path);
    }
    const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
    if (!result || !validation.includes(result.mime)) {
        await (0, promises_1.unlink)(file.path);
        throw new domain_exception_js_1.BadRequestException(`Invalid file format: ${file.originalname}`);
    }
    return {
        file,
        result,
    };
};
exports.processFile = processFile;
const saveFile = async ({ customPath = "general", file, result, }) => {
    if (file.path) {
        await (0, promises_1.unlink)(file.path);
    }
    return file;
};
exports.saveFile = saveFile;
const processFiles = async ({ customPath = "user", files = [], validation = [], }) => {
    const validatedFiles = [];
    for (const file of files) {
        const validatedFile = await (0, exports.processFile)({
            file,
            validation,
        });
        validatedFiles.push(validatedFile);
    }
    const assets = [];
    for (const { file, result } of validatedFiles) {
        const savedFile = await (0, exports.saveFile)({ customPath, file, result });
        assets.push(savedFile);
    }
    return assets;
};
exports.processFiles = processFiles;
const processFields = async ({ customPath = "user", fields = {}, validation = [], }) => {
    const validatedFields = {};
    for (const field of Object.keys(fields)) {
        validatedFields[field] = [];
        for (const file of fields[field]) {
            const validatedFile = await (0, exports.processFile)({
                file,
                validation,
            });
            validatedFields[field].push(validatedFile);
        }
    }
    const assets = {};
    for (const field of Object.keys(validatedFields)) {
        assets[field] = [];
        for (const { file, result } of validatedFields[field]) {
            const savedFile = await (0, exports.saveFile)({
                customPath,
                file,
                result,
            });
            assets[field].push(savedFile);
        }
    }
    return assets;
};
exports.processFields = processFields;
const processMulterUpload = async ({ customPath, req, validation = [], }) => {
    if (req.file) {
        const { file, result } = await (0, exports.processFile)({
            file: req.file,
            validation,
        });
        req.file = await (0, exports.saveFile)({
            customPath,
            file,
            result,
        });
    }
    else if (Array.isArray(req.files)) {
        req.files = await (0, exports.processFiles)({
            customPath,
            files: req.files,
            validation,
        });
    }
    else if (req.files &&
        typeof req.files === "object" &&
        Object.keys(req.files)?.length) {
        req.files = await (0, exports.processFields)({
            customPath,
            fields: req.files,
            validation,
        });
    }
};
exports.processMulterUpload = processMulterUpload;
