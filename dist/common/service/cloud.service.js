"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
const node_crypto_1 = require("node:crypto");
const config_1 = require("./../../config");
const client_s3_1 = require("@aws-sdk/client-s3");
const domain_exception_js_1 = require("../exception/domain.exception.js");
class CloudService {
    cloudClient;
    constructor() {
        this.cloudClient = new client_s3_1.S3Client({
            region: config_1.AWS_REGION,
            credentials: {
                accessKeyId: config_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_1.AWS_ACCESS_SECRET_KEY,
            },
        });
    }
    async uploadAssets({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, file, folder = "general", }) {
        const key = `${config_1.APPLICATION_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: key,
            ACL,
            Body: file.buffer,
        });
        await this.cloudClient.send(command);
        if (!command.input.Key) {
            throw new domain_exception_js_1.BadRequestException("fails to upload this assets");
        }
        return command.input.Key;
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
