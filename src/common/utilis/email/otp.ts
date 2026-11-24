import crypto from "node:crypto";

export const createNumberOtp = ():string=> {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
};