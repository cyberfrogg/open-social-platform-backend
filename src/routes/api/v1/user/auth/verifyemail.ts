import { Express, Request, Response } from "express";
import IRoute from "../../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../../utils/backend/DatabaseQueries";
import ReqResponse from "../../../../../data/shared/reqResponse";
import IsFieldValid from "../../../../../utils/shared/fieldvalidation";
import IsTurnstileValid from "../../../../../utils/backend/isTurnstileValid";
import EmailVerificationToken from "../../../../../data/auth/emailVerificationToken";

class UserVerifyEmail implements IRoute {
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
        const reqVerificationToken = req.body.verificationToken;
        const reqTurnstileCaptcha = req.body.turnstileCaptchaToken;
        const reqUserIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
        const reqFields = [
            { type: 'verificationToken', value: reqVerificationToken },
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

        // get user email verification meta
        const verificationRow = await this.databaseQueries.UserMetaQueries.GetByJsonValue<EmailVerificationToken>(EmailVerificationToken.Keyname, "$.Token", reqVerificationToken);
        if (!verificationRow.success) {
            res.json(new ReqResponse(false, "ERRCODE_BAD_TOKEN", null))
            return;
        }

        // return if already activated
        if (verificationRow.data.Value.IsVerified) {
            res.json(new ReqResponse(false, "ERRCODE_ALREADY_ACTIVATED", null))
            return;
        }

        // WARNING: Remember to verify is string is not "", because we are replacing token with "" to deactivate and thats all.
        // replace email verification token with success
        const newEmailVerificationTokenValue = new EmailVerificationToken("", true, verificationRow.data.Value.VerificateActionExpires);    // new token should be empty because of its uniqueness
        const replacementResult = await this.databaseQueries.UserMetaQueries.Replace(verificationRow.data.UserID, verificationRow.data.Keyname, newEmailVerificationTokenValue);
        if (!replacementResult.success) {
            res.json(new ReqResponse(false, "ERRCODE_EMAIL_VERIFICATION_FAILED", null))
            return;
        }

        // create and return session
        const createSessionResponse = await this.databaseQueries.SessionQueries.CreateSession(verificationRow.data.UserID);
        if (!createSessionResponse.success || createSessionResponse.data == undefined) {
            res.json(new ReqResponse(false, "ERRCODE_SESSION_CREATE_FAILED", null))
            return;
        }
        const createdSessionResponse = await this.databaseQueries.SessionQueries.GetSessionById(createSessionResponse.data);
        if (!createdSessionResponse.success || createdSessionResponse.data == undefined) {
            res.json(new ReqResponse(false, "ERRCODE_SESSION_GET_FAILED", null))
            return;
        }

        res.json(new ReqResponse(true, "", createdSessionResponse.data));
        return;
    }
}

export default UserVerifyEmail;