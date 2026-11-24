import { randomUUID } from "node:crypto";
import {
  AWS_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_SECRET_KEY,
  AWS_REGION,
  APPLICATION_NAME,
  AWS_S3_EXPIRE_IN,
} from "./../../config";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  CompleteMultipartUploadCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { BadRequestException } from "../exception/domain.exception.js";
import { Progress, Upload } from "@aws-sdk/lib-storage";
import { IFile } from "../types/multer.type.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class CloudService {
  private cloudClient: S3Client;
  constructor() {
    this.cloudClient = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_ACCESS_SECRET_KEY,
      },
    });
  }
  async createPreSignedUploadAssetLink({
    Bucket = AWS_BUCKET_NAME,
    ContentType,
    Originalname,
    folder= "general",
    expiresIn = AWS_S3_EXPIRE_IN,
  }: {
    Bucket?: string;
    ContentType: string;
    Originalname: string;
    folder?: String;
    expiresIn?: number;
  }): Promise<{ url: string; Key: string }> {
    const key = `${APPLICATION_NAME}/${folder}/${randomUUID()}_${Originalname}`;
    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      ContentType,
    });
    console.log(key);
    if (!command.input.Key) {
      throw new BadRequestException("fails to upload this assets");
    }
    const url = await getSignedUrl(this.cloudClient, command, { expiresIn });
    return { url, Key: command.input.Key };
  }
  async uploadAsset({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    file,
    folder = "general",
  }: {
    file: Express.Multer.File;
    folder?: string;
    Bucket?: string;
    ACL?: ObjectCannedACL;
  }): Promise<string> {
    const key = `${APPLICATION_NAME}/${folder}/${randomUUID()}_${file?.originalname}`;
    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      ACL,
      Body: file?.buffer,
    });
    await this.cloudClient.send(command);
    if (!command.input.Key) {
      throw new BadRequestException("fails to upload this assets");
    }
    return command.input.Key;
  }
  async uploadAssets({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    files,
    folder = "general",
  }: {
    files: IFile[];
    folder?: string;
    Bucket?: string;
    ACL?: ObjectCannedACL;
  }): Promise<string[]> {
    let urls: string[] = [];
    // no blocking
    urls = await Promise.all(
      files.map((file) => this.uploadAsset({ file, ACL, Bucket, folder })),
    );
    return urls;
  }
  async uploadLargeAsset({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    file,
    folder = "general",
    partSize = 5,
  }: {
    file: Express.Multer.File;
    folder?: string;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    partSize?: number;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const upload = new Upload({
      client: this.cloudClient,
      params: {
        Bucket,
        Key: `${APPLICATION_NAME}/${folder}/${randomUUID()}_${file.originalname}`,
        ACL,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
      partSize: partSize * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (process: Progress) => {
      console.log(
        `file upload is ${((process.loaded as number) / (process.total as number)) * 100}%`,
      );
    });
    return await upload.done();
  }
  async uploadLargeAssets({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    files,
    folder = "general",
    partSize = 5,
  }: {
    files: IFile[];
    folder?: string;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    partSize?: number;
  }): Promise<string[]> {
    const result = await Promise.all(
      files.map((file) =>
        this.uploadLargeAsset({ file, ACL, Bucket, folder, partSize }),
      ),
    );
    return result.map((ele) => ele.Key) as string[];
  }
  async createPreSignedFetchAssetLink({
    Bucket = AWS_BUCKET_NAME,
    Key,
    expiresIn = AWS_S3_EXPIRE_IN,
    download = "false",
    filename,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    download?: "true" | "false";
    filename?: string|undefined;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download == "true"
          ? `attachment;filename"${download || filename}"`
          : undefined,
    });
    return await getSignedUrl(this.cloudClient, command, { expiresIn });
  }
  async getAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });

    return await this.cloudClient.send(command);
  }
  async deleteAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    return await this.cloudClient.send(command);
  }
  async deleteAssets({
    Bucket = AWS_BUCKET_NAME,
    Keys,
  }: {
    Bucket?: string;
    Keys: string[];
  }): Promise<DeleteObjectsCommandOutput> {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: Keys.map((key) => {
          return { Key: key };
        }),
      },
    });

    return await this.cloudClient.send(command);
  }
  async listFolderDirs({
    Bucket = AWS_BUCKET_NAME,
    Prefix,
  }: {
    Bucket?: string;
    Prefix: string;
  }): Promise<ListObjectsV2CommandOutput> {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix,
    });

    return await this.cloudClient.send(command);
  }
  async deleteFolderByPrefix({
    Bucket = AWS_BUCKET_NAME,
    Prefix,
  }: {
    Bucket?: string;
    Prefix: string;
  }): Promise<DeleteObjectCommandOutput> {
    const { Contents } = await this.listFolderDirs({
      Bucket,
      Prefix: `${APPLICATION_NAME}/${Prefix}`,
    });
    const Keys = Contents?.map((ele) => ele.Key as string) || [];
    return await this.deleteAssets({ Keys, Bucket });
  }
}

export const cloudService = new CloudService();
