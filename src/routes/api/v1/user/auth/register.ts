import { Express, Request, Response } from "express";

import IRoute from "../../../../../utils/backend/IRoute";
import ReqResponse from "../../../../../data/shared/reqResponse";
import DatabaseQueries from "../../../../../utils/backend/DatabaseQueries";

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
        let createResponse = await this.databaseQueries.UserQueries.Create("test", "email", "passhash");

        if (!createResponse.success) {
            res.json(new ReqResponse(false, "ERRCODE_USER_CREATE_FAILED", null))
            return;
        }

        let userRowData = await this.databaseQueries.UserQueries.GetRowByID(createResponse.data);

        if (!userRowData.success || userRowData.data == null) {
            res.json(new ReqResponse(false, "ERRCODE_USER_GETBYID_FAILED", null))
            return;
        }

        res.json(new ReqResponse(true, "", userRowData.data.NoEmail().NoPassword()))
    }
}

export default UserRegister;