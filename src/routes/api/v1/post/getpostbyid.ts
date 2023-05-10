import { Express, Request, Response } from "express";
import IRoute from "../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../utils/backend/DatabaseQueries";
import ReqResponse from '../../../../data/shared/reqResponse';
import IsFieldValid from "../../../../utils/shared/fieldvalidation";


class PostGetById implements IRoute {
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
        const reqFields = [
            { type: 'postid', value: req.body.postid }
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

        // get post
        const getResponse = await this.databaseQueries.PostQueries.GetPostsBy("id", req.body.postid);
        if (!getResponse.success || getResponse.data == null || getResponse.data.length == 0) {
            res.json(new ReqResponse(false, "ERRCODE_POST_NOT_FOUND", null));
            return;
        }

        const targetPost = getResponse.data[0];

        res.json(new ReqResponse(true, "", targetPost));
    }
}

export default PostGetById;