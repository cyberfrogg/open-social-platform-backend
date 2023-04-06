import { Express, Request, Response } from "express";

import IRoute from "../../../../../utils/backend/IRoute";
import ReqResponse from "../../../../../data/shared/reqResponse";
import DatabaseQueries from "../../../../../utils/backend/DatabaseQueries";
import IsFieldValid from '../../../../../utils/shared/fieldvalidation';
import { GenerateRandomString, HashString } from "../../../../../utils/shared/stringutils";
import EmailVerificationToken from '../../../../../data/auth/emailVerificationToken';
import SendEmail from '../../../../../utils/backend/sendemail';
import GetEmailTemplateVerifyAccount from "../../../../../utils/backend/emailtemplates";
import SaltValuePair from '../../../../../utils/shared/saltvaluepair';
import IsTurnstileValid from "../../../../../utils/backend/isTurnstileValid";

class UserRegister implements IRoute {
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
        // retrieve fields
        const reqUserNickname = req.body.nickname;
        const reqUserEmail = req.body.email;
        const reqUserPassword = req.body.password;
        const reqUserTurnstileCaptcha = req.body.turnstileCaptchaToken;
        const reqUserIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
        const reqFields = [
            { type: 'nickname', value: reqUserNickname },
            { type: 'email', value: reqUserEmail },
            { type: 'password', value: reqUserPassword },
            { type: 'turnstileCaptchaToken', value: reqUserTurnstileCaptcha }
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
        const isCaptchaValid = await IsTurnstileValid(reqUserTurnstileCaptcha, reqUserIp);
        if (!isCaptchaValid) {
            res.json(new ReqResponse(false, "ERRCODE_CAPTCHA_FAILED", null))
            return;
        }

        let isUserFoundWithEmailOrNickname = false;

        // isUserExistsWithEmail
        let isUserExistsWithEmail = await this.databaseQueries.UserQueries.GetRowByEmail(reqUserEmail);

        if (!isUserExistsWithEmail.success) {
            res.json(new ReqResponse(false, "ERRCODE_USER_VALIDATION_FAILED", null))
            return;
        }

        if (isUserExistsWithEmail.data != null) {
            isUserFoundWithEmailOrNickname = true;
        }

        // isUserExistsWithNickname
        let isUserExistsWithNickname = await this.databaseQueries.UserQueries.GetRowByEmail(reqUserNickname);

        if (!isUserExistsWithNickname.success) {
            res.json(new ReqResponse(false, "ERRCODE_USER_VALIDATION_FAILED", null))
            return;
        }

        if (isUserExistsWithNickname.data != null) {
            isUserFoundWithEmailOrNickname = true;
        }

        // delete if user exists and not verified
        if (isUserFoundWithEmailOrNickname) {
            let userId = isUserExistsWithEmail.data != null ? isUserExistsWithEmail.data.ID : isUserExistsWithNickname.data.ID;
            let isUserVerified = await this.databaseQueries.UserMetaQueries.Get<EmailVerificationToken>(userId, EmailVerificationToken.Keyname);

            if (!isUserVerified.success || isUserVerified.data.Value.IsVerified) {
                res.json(new ReqResponse(false, "ERRCODE_USER_EXISTS", null));
                return
            }

            if (!isUserVerified.data.Value.IsVerified) {
                let deleteResponse = await this.databaseQueries.UserQueries.DeleteCompletlyByID(userId);
                if (!deleteResponse.success || !deleteResponse.data) {
                    res.json(new ReqResponse(false, "ERRCODE_USER_REWRITE_FAILED", null));
                    return
                }
            } else {
                res.json(new ReqResponse(false, "ERRCODE_USER_EXISTS", null));
                return
            }
        }



        // ACCOUNT CREATION //

        // hash user password
        const reqUserPasswordSaltValuePairRaw = SaltValuePair.CreateSaltAndHashValue(reqUserPassword).ToRaw();

        // create user
        let createResponse = await this.databaseQueries.UserQueries.Create(reqUserNickname, reqUserEmail, reqUserPasswordSaltValuePairRaw);

        if (!createResponse.success) {
            res.json(new ReqResponse(false, "ERRCODE_USER_CREATE_FAILED", null))
            return;
        }

        // get user data to return
        let userRowData = await this.databaseQueries.UserQueries.GetRowByID(createResponse.data);

        if (!userRowData.success || userRowData.data == null) {
            res.json(new ReqResponse(false, "ERRCODE_USER_GETBYID_FAILED", null))
            return;
        }


        // generate email verification row
        const emailVerificationToken = GenerateRandomString(50);
        const emailVerificationTokenData = new EmailVerificationToken(emailVerificationToken, false, new Date(Date.now()));

        let emailVerificationTokenInsertionResponse = await this.databaseQueries.UserMetaQueries.Replace(userRowData.data.ID, EmailVerificationToken.Keyname, emailVerificationTokenData);
        if (!emailVerificationTokenInsertionResponse.success) {
            res.json(new ReqResponse(false, "ERRCODE_EMAIL_VERIFICATION_FAILED"))
            return;
        }

        // send email verification 
        try {
            let emailTemplate = GetEmailTemplateVerifyAccount(emailVerificationToken);
            await SendEmail(reqUserEmail, "Email Verification", emailTemplate);
        }
        catch (e) {
            console.error(e);
            res.json(new ReqResponse(false, "ERRCODE_EMAIL_VERIFICATION_SEND_FAILED"))
            return;
        }

        // return success :)
        res.json(new ReqResponse(true, "", userRowData.data.NoEmail().NoPassword()))
    }
}

export default UserRegister;