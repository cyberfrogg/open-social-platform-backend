import { Express, Request, Response } from "express";
import IRoute from "../../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../../utils/backend/DatabaseQueries";
import ReqResponse from "../../../../../data/shared/reqResponse";
import IsFieldValid from "../../../../../utils/shared/fieldvalidation";
import IsTurnstileValid from "../../../../../utils/backend/isTurnstileValid";
import ResetPasswordToken from '../../../../../data/auth/resetPasswordToken';
import SaltValuePair from "../../../../../utils/shared/saltvaluepair";
import { GetEmailTemplateResetPasswordComplete } from "../../../../../utils/backend/emailtemplates";
import SendEmail from '../../../../../utils/backend/sendemail';


class UserResetPasswordComplete implements IRoute {
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
        const reqResetToken = req.body.resettoken;
        const reqUserPassword = req.body.password;
        const reqTurnstileCaptcha = req.body.turnstileCaptchaToken;
        const reqUserIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
        const reqFields = [
            { type: 'passwordResetToken', value: reqResetToken },
            { type: 'password', value: reqUserPassword },
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

        // get user reset password token meta
        const resetPasswordRow = await this.databaseQueries.UserMetaQueries.GetByJsonValue<ResetPasswordToken>(ResetPasswordToken.Keyname, "$.Token", reqResetToken);
        if (!resetPasswordRow.success || resetPasswordRow.data == null) {
            res.json(new ReqResponse(false, "ERRCODE_BAD_TOKEN", null))
            return;
        }
        resetPasswordRow.data.Value.ActionExpires = new Date(resetPasswordRow.data.Value.ActionExpires);

        // get user
        const userRow = await this.databaseQueries.UserQueries.GetRowByID(resetPasswordRow.data.UserID);
        if (!userRow.success || userRow.data == null) {
            res.json(new ReqResponse(false, "ERRCODE_USER_NOT_FOUND", null))
            return;
        }

        // remove password reset meta 
        const passwordResetMetaRemoveResult = await this.databaseQueries.UserMetaQueries.Delete(userRow.data.ID, ResetPasswordToken.Keyname);
        if (!passwordResetMetaRemoveResult.success || passwordResetMetaRemoveResult.data == false) {
            res.json(new ReqResponse(false, "ERRCODE_USER_PASSWORD_RESET_FAILED", null))
            return;
        }

        // hash input password and update password to new one
        const reqUserPasswordSaltValuePairRaw = SaltValuePair.CreateSaltAndHashValue(reqUserPassword).ToRaw();
        const passwordUpdateResult = await this.databaseQueries.UserQueries.UpdatePasswordById(userRow.data.ID, reqUserPasswordSaltValuePairRaw);
        if (!passwordUpdateResult.success || passwordUpdateResult.data == false) {
            res.json(new ReqResponse(false, "ERRCODE_USER_PASSWORD_RESET_FAILED", null))
            return;
        }

        // send email, that password has been reset
        try {
            const emaiTemplate = GetEmailTemplateResetPasswordComplete();

            await SendEmail(userRow.data.Email, "Password has been reset", emaiTemplate);
        }
        catch (emailError) {
            console.error(emailError);
        }

        // return success :)
        res.json(new ReqResponse(true, "", null))
        return;
    }
}

export default UserResetPasswordComplete;