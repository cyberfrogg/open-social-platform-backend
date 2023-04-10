import { Express, Request, Response } from "express";
import IRoute from "../../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../../utils/backend/DatabaseQueries";
import ReqResponse from "../../../../../data/shared/reqResponse";
import IsFieldValid from "../../../../../utils/shared/fieldvalidation";
import IsTurnstileValid from "../../../../../utils/backend/isTurnstileValid";
import UserRowData from '../../../../../data/user/userrowdata';
import SaltValuePair from '../../../../../utils/shared/saltvaluepair';
import { HashStringWithSalt } from "../../../../../utils/shared/stringutils";
import EmailVerificationToken from "../../../../../data/auth/emailVerificationToken";

class UserLogin implements IRoute {
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
        const reqUserNicknameOrEmail = req.body.nicknameOrEmail;
        const reqUserPassword = req.body.password;
        const reqUserTurnstileCaptcha = req.body.turnstileCaptchaToken;
        const reqUserIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
        const reqFields = [
            { type: 'nicknameOrEmail', value: reqUserNicknameOrEmail },
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

        // find target user
        let foundUserByNickname = await this.databaseQueries.UserQueries.GetRowByNickname(reqUserNicknameOrEmail);
        let foundUserByEmail = await this.databaseQueries.UserQueries.GetRowByEmail(reqUserNicknameOrEmail);

        let targetUser: UserRowData = null;

        if (foundUserByNickname.success && foundUserByNickname.data != null) {
            targetUser = foundUserByNickname.data;
        }
        else if (foundUserByEmail.success && foundUserByEmail.data != null) {
            targetUser = foundUserByNickname.data;
        }
        else {
            targetUser = null;
        }

        if (targetUser == null) {
            res.json(new ReqResponse(false, "ERRCODE_INVALID_CREDITS", null))
            return;
        }

        // validate password
        const dbPasswordSaltValuePair = SaltValuePair.FromRaw(targetUser.Password);
        const reqPasswordHash = HashStringWithSalt(reqUserPassword, dbPasswordSaltValuePair.Salt);

        const isPasswordMatch = reqPasswordHash == dbPasswordSaltValuePair.Value;

        if (!isPasswordMatch) {
            res.json(new ReqResponse(false, "ERRCODE_INVALID_CREDITS", null))
            return;
        }

        // check if user's email is verified
        const emailVerificationMetaRow = await this.databaseQueries.UserMetaQueries.Get<EmailVerificationToken>(targetUser.ID, EmailVerificationToken.Keyname);
        if (!emailVerificationMetaRow.success || emailVerificationMetaRow.data == null) {
            res.json(new ReqResponse(false, "ERRCODE_UNKNOWN", null))
            return;
        }
        if (!emailVerificationMetaRow.data.Value.IsVerified) {
            res.json(new ReqResponse(false, "ERRCODE_USER_EMAIL_NOT_VERIFIED", null))
            return;
        }

        // create session
        const createdSessionId = await this.databaseQueries.SessionQueries.CreateSession(targetUser.ID);
        if (!createdSessionId.success) {
            res.json(new ReqResponse(false, "ERRCODE_SESSION_CREATE_FAILED", null))
            return;
        }

        const createdSessionData = await this.databaseQueries.SessionQueries.GetSessionById(createdSessionId.data);
        if (!createdSessionData.success) {
            res.json(new ReqResponse(false, "ERRCODE_SESSION_CREATE_FAILED", null))
            return;
        }

        res.json(new ReqResponse(true, "", createdSessionData.data));
        return;
    }
}

export default UserLogin;