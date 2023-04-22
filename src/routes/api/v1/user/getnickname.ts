import { Express, Request, Response } from "express";
import IRoute from "../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../utils/backend/DatabaseQueries";
import ReqResponse from "../../../../data/shared/reqResponse";
import IsFieldValid from "../../../../utils/shared/fieldvalidation";

class UserGetNickname implements IRoute {
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
        const reqUserId = req.body.userid;
        const reqFields = [
            { type: 'userid', value: reqUserId }
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

        const userRow = await this.databaseQueries.UserQueries.GetRowByID(reqUserId);
        if (!userRow.success || userRow.data == null) {
            res.json(new ReqResponse(false, userRow.message, null))
            return;
        }

        const userNickname = userRow.data.Nickname;

        res.json(new ReqResponse(true, "", userNickname));
        return;
    }
}

export default UserGetNickname;