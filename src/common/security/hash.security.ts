import bcrypt from "bcrypt";
import argon2 from "argon2";

export const hash = async ({
  plaintext,
  round = 12,
  minor = "b",
  approach = "bcrypt",
}: {
  plaintext: string;
  round?: number;
  minor?: "a" | "b";
  approach?: string;
}):Promise<string> => {
  let ciphertext = "";
  switch (approach) {
    case "bcrypt":
      const salt = (await bcrypt.genSalt(round, minor)).toString();
      ciphertext = await bcrypt.hash(plaintext, salt);
      break;
    case "argon2":
      ciphertext = await argon2.hash(plaintext);
      break;

    default:
      break;
  }
  return ciphertext;
};

export const compare = async (plaintext:string|number, ciphertext:string, approach:string = "bcrypt"):Promise<Boolean> => {
  let match = false;
  switch (approach) {
    case "bcrypt":
      match = await bcrypt.compare(plaintext as string, ciphertext )  ;
      break;
    case "argon2":
      match = await argon2.verify(ciphertext, plaintext as string);
      break;

    default:
      break;
  }
  return match;
};
