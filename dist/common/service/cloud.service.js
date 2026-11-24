"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
const node_crypto_1 = require("node:crypto");
const config_1 = require("./../../config");
const client_s3_1 = require("@aws-sdk/client-s3");
const domain_exception_js_1 = require("../exception/domain.exception.js");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
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
    async createPreSignedUploadAssetLink({ Bucket = config_1.AWS_BUCKET_NAME, ContentType, Originalname, folder = "general", expiresIn = config_1.AWS_S3_EXPIRE_IN, }) {
        const key = `${config_1.APPLICATION_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}_${Originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: key,
            ContentType,
        });
        console.log(key);
        if (!command.input.Key) {
            throw new domain_exception_js_1.BadRequestException("fails to upload this assets");
        }
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.cloudClient, command, { expiresIn });
        return { url, Key: command.input.Key };
    }
    async uploadAsset({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, file, folder = "general", }) {
        const key = `${config_1.APPLICATION_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}_${file?.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: key,
            ACL,
            Body: file?.buffer,
        });
        await this.cloudClient.send(command);
        if (!command.input.Key) {
            throw new domain_exception_js_1.BadRequestException("fails to upload this assets");
        }
        return command.input.Key;
    }
    async uploadAssets({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, files, folder = "general", }) {
        let urls = [];
        urls = await Promise.all(files.map((file) => this.uploadAsset({ file, ACL, Bucket, folder })));
        return urls;
    }
    async uploadLargeAsset({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, file, folder = "general", partSize = 5, }) {
        const upload = new lib_storage_1.Upload({
            client: this.cloudClient,
            params: {
                Bucket,
                Key: `${config_1.APPLICATION_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`,
                ACL,
                Body: file.buffer,
                ContentType: file.mimetype,
            },
            partSize: partSize * 1024 * 1024,
        });
        upload.on("httpUploadProgress", (process) => {
            console.log(`file upload is ${(process.loaded / process.total) * 100}%`);
        });
        return await upload.done();
    }
    async uploadLargeAssets({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, files, folder = "general", partSize = 5, }) {
        const result = await Promise.all(files.map((file) => this.uploadLargeAsset({ file, ACL, Bucket, folder, partSize })));
        return result.map((ele) => ele.Key);
    }
    async createPreSignedFetchAssetLink({ Bucket = config_1.AWS_BUCKET_NAME, Key, expiresIn = config_1.AWS_S3_EXPIRE_IN, download = "false", filename, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download == "true"
                ? `attachment;filename"${download || filename}"`
                : undefined,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.cloudClient, command, { expiresIn });
    }
    async getAsset({ Bucket = config_1.AWS_BUCKET_NAME, Key, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
        });
        return await this.cloudClient.send(command);
    }
    async deleteAsset({ Bucket = config_1.AWS_BUCKET_NAME, Key, }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key,
        });
        return await this.cloudClient.send(command);
    }
    async deleteAssets({ Bucket = config_1.AWS_BUCKET_NAME, Keys, }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys.map((key) => {
                    return { Key: key };
                }),
            },
        });
        return await this.cloudClient.send(command);
    }
    async listFolderDirs({ Bucket = config_1.AWS_BUCKET_NAME, Prefix, }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix,
        });
        return await this.cloudClient.send(command);
    }
    async deleteFolderByPrefix({ Bucket = config_1.AWS_BUCKET_NAME, Prefix, }) {
        const { Contents } = await this.listFolderDirs({
            Bucket,
            Prefix: `${config_1.APPLICATION_NAME}/${Prefix}`,
        });
        const Keys = Contents?.map((ele) => ele.Key) || [];
        return await this.deleteAssets({ Keys, Bucket });
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
