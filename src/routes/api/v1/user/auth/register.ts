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
        let response = await this.databaseQueries.UserQueries.Create("test", "email", "passhash");

        res.json(new ReqResponse(true, "", response))
    }
}

export default UserRegister;