import crypto from "crypto";

export const randomString = (length = 22) => {
    return crypto
        .randomBytes(length)
        .toString("hex")
        .slice(0, length - 1);
};

export const createHashMD5 = (value) => {
    return crypto.createHash("md5").update(value).digest("hex");
};

const algorithm = "aes-256-ctr";
const key = "SDF3eGGjkyulkuiop3Ef42vsgaemEfeq";

export const encrypt = (data) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    return {
        iv: iv.toString("hex"),
        content: encrypted.toString("hex"),
    };
};

export const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, "hex"));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, "hex")), decipher.final()]);

    return decrypted.toString();
};
