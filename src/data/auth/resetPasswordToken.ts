class ResetPasswordToken {
    static readonly Keyname: string = "ResetPasswordToken";
    Token: string;
    ActionExpires: Date;

    constructor(token: string, actionExpirationDate: Date) {
        this.Token = token;
        this.ActionExpires = actionExpirationDate;
    }
}

export default ResetPasswordToken