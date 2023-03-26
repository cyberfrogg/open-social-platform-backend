import { Express, Request, Response } from "express";

import IRoute from "../../../../../utils/backend/IRoute";
import ReqResponse from "../../../../../data/shared/reqResponse";
import DatabaseQueries from "../../../../../utils/backend/DatabaseQueries";
import IsFieldValid from '../../../../../utils/shared/fieldvalidation';

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
        const reqUserNickname = req.body.nickname;
        const reqUserEmail = req.body.email;
        const reqUserPassword = req.body.password;
        const reqFields = [
            { type: 'nickname', value: reqUserNickname },
            { type: 'email', value: reqUserEmail },
            { type: 'password', value: reqUserPassword },
        ];

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


        // isUserExistsWithEmail
        let isUserExistsWithEmail = await this.databaseQueries.UserQueries.GetRowByEmail(reqUserEmail);

        if (!isUserExistsWithEmail.success) {
            res.json(new ReqResponse(false, "ERRCODE_USER_VALIDATION_FAILED", null))
            return;
        }

        if (isUserExistsWithEmail.data != null) {
            res.json(new ReqResponse(false, "ERRCODE_USER_EXISTS", null))
            return;
        }


        // isUserExistsWithNickname
        let isUserExistsWithNickname = await this.databaseQueries.UserQueries.GetRowByEmail(reqUserNickname);

        if (!isUserExistsWithNickname.success) {
            res.json(new ReqResponse(false, "ERRCODE_USER_VALIDATION_FAILED", null))
            return;
        }

        if (isUserExistsWithNickname.data != null) {
            res.json(new ReqResponse(false, "ERRCODE_USER_EXISTS", null))
            return;
        }


        // create user
        let createResponse = await this.databaseQueries.UserQueries.Create(reqUserNickname, reqUserEmail, reqUserPassword);

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

        res.json(new ReqResponse(true, "", userRowData.data.NoEmail().NoPassword()))
    }
}

export default UserRegister;