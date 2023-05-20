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

const TextToSlug = (value: string): string => {
    return value.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

export { GenerateRandomString, HashString, HashStringWithSalt, TextToSlug }