import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../../exception/domain.exception.js";
import { Request } from "express";
import { StorageApproachEnum } from "../../enum/multer.enum.js";
import { tmpdir } from "node:os";

export const FileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};
interface SaveFileResult {
  ext: string;
}

export const localFileUpload = ({
  maxFileSize = 5,
  storageApproach = StorageApproachEnum.MEMORY,
}: {
  maxFileSize?: number;
  storageApproach?: StorageApproachEnum;
}) => {
  const storage =
    storageApproach == StorageApproachEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination(req, file, callback) {
            callback(null, tmpdir());
          },
          filename(req, file, callback) {
            callback(null, randomUUID() + file.originalname);
          },
        });
  return multer({
    storage,
    limits: {
      fileSize: maxFileSize * 1024 * 1024,
    },
  });
};

// for single file
export const processFile = async ({
  file,
  validation = [],
}: {
  file: Express.Multer.File;
  validation: string[];
}) => {
  if (file.path) {
    file.buffer = await readFile(file.path);
  }
  const result = await fileTypeFromBuffer(file.buffer);
  if (!result || !validation.includes(result.mime)) {
    await unlink(file.path);
    throw new BadRequestException(`Invalid file format: ${file.originalname}`);
  }

  return {
    file,
    result,
  };
};

// save one file
export const saveFile = async ({
  customPath = "general",
  file,
  result,
}: {
  customPath?: string;
  file: Express.Multer.File;
  result: SaveFileResult;
}) => {
  // await mkdir(resolve(`assets/${customPath}`), { recursive: true });
  // const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;
  // await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
  if (file.path) {
    await unlink(file.path);
  }
  // file.path = uniqueFilePath;

  return file;
};

// for array
export const processFiles = async ({
  customPath = "user",
  files = [],
  validation = [],
}: {
  customPath?: string;
  files: Express.Multer.File[];
  validation: string[];
}) => {
  const validatedFiles = [];

  for (const file of files) {
    const validatedFile = await processFile({
      file,
      validation,
    });

    validatedFiles.push(validatedFile);
  }
  const assets = [];
  for (const { file, result } of validatedFiles) {
    const savedFile = await saveFile({ customPath, file, result });

    assets.push(savedFile);
  }
  return assets;
};

// for fields

export const processFields = async ({
  customPath = "user",
  fields = {},
  validation = [],
}: {
  customPath?: string;
  fields: Record<string, Express.Multer.File[]>;
  validation?: string[];
}): Promise<Record<string, Express.Multer.File[]>> => {
  const validatedFields: Record<
    string,
    { file: Express.Multer.File; result: SaveFileResult }[]
  > = {};

  for (const field of Object.keys(fields)) {
    validatedFields[field] = [];

    for (const file of fields[field]!) {
      const validatedFile = await processFile({
        file,
        validation,
      });

      validatedFields[field].push(validatedFile);
    }
  }

  // Save all files
  const assets: Record<string, Express.Multer.File[]> = {};
  for (const field of Object.keys(validatedFields)) {
    assets[field] = [];

    for (const { file, result } of validatedFields[field]!) {
      const savedFile = await saveFile({
        customPath,
        file,
        result,
      });

      assets[field].push(savedFile);
    }
  }

  return assets;
};

export const processMulterUpload = async ({
  customPath,
  req,
  validation = [],
}: {
  customPath: string;
  req: Request;
  validation: string[];
}) => {
  if (req.file) {
    const { file, result } = await processFile({
      file: req.file,
      validation,
    });
    req.file = await saveFile({
      customPath,
      file,
      result,
    });
  } else if (Array.isArray(req.files)) {
    req.files = await processFiles({
      customPath,
      files: req.files,
      validation,
    });
  } else if (
    req.files &&
    typeof req.files === "object" &&
    Object.keys(req.files)?.length
  ) {
    (req.files as Record<string, Express.Multer.File[]>) = await processFields({
      customPath,
      fields: req.files as Record<string, Express.Multer.File[]>,
      validation,
    });
  }
};
