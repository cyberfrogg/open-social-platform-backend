import { Express, Request, Response } from "express";

import IRoute from "../../../utils/backend/IRoute";
import ReqResponse from "../../../data/shared/reqResponse";

class Ping implements IRoute {
    readonly path: string;

    constructor(path) {
        this.path = path;
    }

    async Initialize(expressApp: Express): Promise<void> {
        expressApp.post(this.path, this.Execute);
    }

    async Execute(req: Request, res: Response) {
        res.json(new ReqResponse(true, "", "pong! (user)"))
    }
}

export default Ping;