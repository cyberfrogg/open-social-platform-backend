class EmailVerificationToken {
    static readonly Keyname: string = "emailVerificationToken";
    Token: string;
    IsVerified: boolean;
    VerificateActionExpires: Date;

    constructor(token: string, isVerified: boolean, verificationActionExpirationDate: Date) {
        this.Token = token;
        this.VerificateActionExpires = verificationActionExpirationDate;
        this.IsVerified = isVerified;
    }
}

export default EmailVerificationToken