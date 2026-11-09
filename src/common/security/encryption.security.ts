import crypto from "node:crypto";
import { ENC_KEY, IV_LENGTH } from "../../config.js";

export const encryption = async (plaintext: string):Promise<String> => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);
  let encryptedData = cipher.update(plaintext, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}::${encryptedData}`;
};

export const decryption = async (ciphertext: string):Promise<String> => {
  const [iv, encryptedData] = ciphertext.split("::") as [string, string];
  const iv_vector:Buffer = Buffer.from(iv as string, "hex");
  const decryptedVector = crypto.createDecipheriv(
    "aes-256-cbc",
    ENC_KEY,
    iv_vector,
  );
  let plaintext = decryptedVector.update(encryptedData, "hex", "utf-8");
  plaintext += decryptedVector.final("utf-8");
  return plaintext;
};
