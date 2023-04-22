import { Express, Request, Response } from "express";
import IRoute from "../../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../../utils/backend/DatabaseQueries";
import ReqResponse from "../../../../../data/shared/reqResponse";
import IsFieldValid from "../../../../../utils/shared/fieldvalidation";
import IsTurnstileValid from "../../../../../utils/backend/isTurnstileValid";
import { GenerateRandomString } from "../../../../../utils/shared/stringutils";
import ResetPasswordToken from '../../../../../data/auth/resetPasswordToken';
import SendEmail from "../../../../../utils/backend/sendemail";
import { GetEmailTemplateResetPassword } from "../../../../../utils/backend/emailtemplates";
import EmailVerificationToken from "../../../../../data/auth/emailVerificationToken";
import IsDateExpired from '../../../../../utils/shared/isDateExpired';

const PASSWORD_RESET_TOKEN_EXPIRATION_DAYS = 1;

class UserResetPasswordStart implements IRoute {
    readonly path: string;
    readonly databaseQueries: DatabaseQueries;

    constructor(path: string, databaseQueries: DatabaseQueries) {
        this.path = path;
        this.databaseQueries = databaseQueries;
    }

    async Initialize(expressApp: Express): Promise<void> {
        expressApp.post(this.path, this.Execute);
    }

    Execute = async (req: Request, res: Response) => {
        const reqUserEmail = req.body.email;
        const reqTurnstileCaptcha = req.body.turnstileCaptchaToken;
        const reqUserIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
        const reqFields = [
            { type: 'email', value: reqUserEmail },
            { type: 'turnstileCaptchaToken', value: reqTurnstileCaptcha }
        ];

        // validate fields
        for (const reqField of reqFields) {
            if (reqField.value == undefined) {
                res.json(new ReqResponse(false, "ERRCODE_EMPTY_FIELDS", null))
                return;
            }

            const validateResult = IsFieldValid(reqField.value, reqField.type);
            if (!validateResult.success) {
                res.json(new ReqResponse(false, validateResult.message, validateResult.data))
                return;
            }
        }

        // is captcha valid
        const isCaptchaValid = await IsTurnstileValid(reqTurnstileCaptcha, reqUserIp);
        if (!isCaptchaValid) {
            res.json(new ReqResponse(false, "ERRCODE_CAPTCHA_FAILED", null))
            return;
        }

        // get user by email
        const userRowData = await this.databaseQueries.UserQueries.GetRowByEmail(reqUserEmail);
        if (!userRowData.success || userRowData.data == null) {
            console.log(userRowData);
            res.json(new ReqResponse(false, "ERRCODE_USER_NOT_FOUND", null))
            return;
        }

        // check if user's email is verified
        const emailVerificationMetaRow = await this.databaseQueries.UserMetaQueries.Get<EmailVerificationToken>(userRowData.data.ID, EmailVerificationToken.Keyname);
        if (!emailVerificationMetaRow.success || emailVerificationMetaRow.data == null) {
            res.json(new ReqResponse(false, "ERRCODE_UNKNOWN", null))
            return;
        }
        if (!emailVerificationMetaRow.data.Value.IsVerified) {
            res.json(new ReqResponse(false, "ERRCODE_USER_EMAIL_NOT_VERIFIED", null))
            return;
        }

        // check if password reset meta exists
        const passwordResetTokenExists = await this.databaseQueries.UserMetaQueries.Exists(userRowData.data.ID, ResetPasswordToken.Keyname);
        if (!passwordResetTokenExists.success) {
            res.json(new ReqResponse(false, "ERRCODE_PASSWORD_RESET_FAILED"))
            return;
        }

        // delete row if password reset meta exists
        if (passwordResetTokenExists.data == true) {
            // get reset token
            const passwordResetTokenMetaRow = await this.databaseQueries.UserMetaQueries.Get<ResetPasswordToken>(userRowData.data.ID, ResetPasswordToken.Keyname);
            if (!passwordResetTokenMetaRow.success || passwordResetTokenMetaRow.data == null) {
                res.json(new ReqResponse(false, "ERRCODE_PASSWORD_RESET_FAILED"))
                return;
            }

            if (!IsDateExpired(passwordResetTokenMetaRow.data.Value.ActionExpires)) {
                res.json(new ReqResponse(false, "ERRCODE_RATELIMITED"))
                return;
            }

            const passwordResetTokenDeletion = await this.databaseQueries.UserMetaQueries.Delete(userRowData.data.ID, ResetPasswordToken.Keyname);
            if (!passwordResetTokenDeletion.success) {
                res.json(new ReqResponse(false, "ERRCODE_PASSWORD_RESET_FAILED"))
                return;
            }
        }

        // generate password reset token row
        const passwordResetToken = GenerateRandomString(50);
        const passwordResetTokenExpiration = new Date(Date.now() + (PASSWORD_RESET_TOKEN_EXPIRATION_DAYS * 3600 * 1000 * 24));
        const passwordResetData = new ResetPasswordToken(passwordResetToken, passwordResetTokenExpiration);

        const passwordResetInsertionResponse = await this.databaseQueries.UserMetaQueries.Replace(userRowData.data.ID, ResetPasswordToken.Keyname, passwordResetData);
        if (!passwordResetInsertionResponse.success) {
            res.json(new ReqResponse(false, "ERRCODE_PASSWORD_RESET_FAILED"))
            return;
        }

        // send password reset instructions 
        try {
            let emailTemplate = GetEmailTemplateResetPassword(passwordResetToken);
            await SendEmail(reqUserEmail, "Password Reset", emailTemplate);
        }
        catch (e) {
            console.error(e);
            res.json(new ReqResponse(false, "ERRCODE_EMAIL_SEND_FAILED"))
            return;
        }

        // return success :)
        res.json(new ReqResponse(true, "", null));
        return;
    }
}

export default UserResetPasswordStart;