import { Express, Request, Response } from "express";

import IRoute from "../../../utils/backend/IRoute";
import ApiResponse from "../../../data/shared/apiResponse";

class Ping implements IRoute {
    readonly path: string;

    constructor(path) {
        this.path = path;
    }

    async Initialize(expressApp: Express): Promise<void> {
        expressApp.post(this.path, this.Execute);
    }

    async Execute(req: Request, res: Response) {
        res.json(new ApiResponse(true, "", "pong!"))
    }
}

export default Ping;