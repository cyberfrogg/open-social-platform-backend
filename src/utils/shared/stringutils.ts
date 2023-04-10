import crypto from "crypto";

const GenerateRandomString = (length: number) => {
    return crypto.randomBytes(length).toString("hex");
}

const HashString = (value: string) => {
    return crypto.createHash('sha256').update(value).digest('hex').toString();
}

const HashStringWithSalt = (value: string, salt: string) => {
    return HashString(salt + value);
}

export { GenerateRandomString, HashString, HashStringWithSalt }