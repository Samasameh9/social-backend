import { randomUUID } from "node:crypto";
import {
  AWS_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_SECRET_KEY,
  AWS_REGION,
  APPLICATION_NAME,
} from "./../../config";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { BadRequestException } from "../exception/domain.exception.js";

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
  async uploadAssets({
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
    const key = `${APPLICATION_NAME}/${folder}/${randomUUID()}_${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      ACL,
      Body: file.buffer,
    });
    await this.cloudClient.send(command);
    if(!command.input.Key){
        throw new BadRequestException("fails to upload this assets")
    }
    return command.input.Key;
  }
}

export const cloudService=new CloudService()
