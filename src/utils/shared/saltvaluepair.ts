import { GenerateRandomString, HashString, HashStringWithSalt } from "./stringutils";

class SaltValuePair {
    static readonly Separator: string = "|";
    static readonly SaltSize: number = 10;
    Salt: string;
    Value: string;

    constructor(salt: string, value: string) {
        this.Salt = salt;
        this.Value = value;
    }

    static Create(salt: string, value: string) {
        return new SaltValuePair(salt, value);
    }

    static CreateSaltAndHashValue(value: string) {
        let salt = GenerateRandomString(SaltValuePair.SaltSize);
        let hashedSaltedValue = HashStringWithSalt(value, salt);
        return new SaltValuePair(salt, hashedSaltedValue);
    }

    static FromRaw = (raw: string) => {
        let arr = raw.split(SaltValuePair.Separator);

        if (arr.length != 2)
            return undefined;

        let salt = arr[0];
        let val = arr[1];
        return new SaltValuePair(salt, val);
    }

    ToRaw = () => {
        return this.Salt + SaltValuePair.Separator + this.Value;
    }

    IsEqualsTo(other: SaltValuePair) {
        return other.Salt == this.Salt && other.Value == this.Value;
    }
}

export default SaltValuePair;