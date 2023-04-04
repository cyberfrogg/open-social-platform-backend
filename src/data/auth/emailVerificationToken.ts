class EmailVerificationToken {
    Token: string;
    Expires: Date;

    constructor(token: string, expires: Date) {
        this.Token = token;
        this.Expires = expires;
    }
}

export default EmailVerificationToken