import { Express, Request, Response } from "express";
import IRoute from "../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../utils/backend/DatabaseQueries";
import ReqResponse from '../../../../data/shared/reqResponse';
import RangeVal from '../../../../data/shared/rangeVal';


class PostGetBy implements IRoute {
    readonly limitRange: RangeVal;
    readonly path: string;
    readonly databaseQueries: DatabaseQueries;

    constructor(path: string, databaseQueries: DatabaseQueries) {
        this.path = path;
        this.databaseQueries = databaseQueries;
        this.limitRange = new RangeVal(Number(process.env.POSTS_GETBY_MIN_POSTS_LIMIT), Number(process.env.POSTS_GETBY_MAX_POSTS_LIMIT));
    }

    async Initialize(expressApp: Express): Promise<void> {
        expressApp.post(this.path, this.Execute);
    }

    Execute = async (req: Request, res: Response) => {
        const reqFieldValue = req.body.value;
        const reqFieldColumnname = req.body.columnname;
        const reqFieldIsReverse = req.body.isReverse || req.body.isReverse == "true" || req.body.isReverse == "1";
        const reqFieldOrderBy = req.body.orderBy;
        const reqFieldLimit = this.limitRange.Clamp(Number(req.body.limit));
        const reqFieldOffset = Number(req.body.offset);

        const reqFields = [
            { type: 'value', value: reqFieldValue },
            { type: 'columnname', value: reqFieldColumnname, },
            { type: 'isReverse', value: reqFieldIsReverse },
            { type: 'orderBy', value: reqFieldOrderBy },
            { type: 'limit', value: reqFieldLimit },
            { type: 'offset', value: reqFieldOffset }
        ];

        // validate fields
        for (const reqField of reqFields) {
            if (reqField.value == undefined || reqField.value == null) {
                res.json(new ReqResponse(false, "ERRCODE_EMPTY_FIELDS", null));
                return;
            }

            if (reqField.type == "offset" && Number.isNaN(reqField.value)) {
                res.json(new ReqResponse(false, "ERRCODE_EMPTY_FIELDS", null));
                return;
            }
        }

        // get post
        const getResponse = await this.databaseQueries.PostQueries.GetPostsBy(
            reqFieldColumnname,
            reqFieldValue,
            reqFieldOrderBy,
            reqFieldIsReverse,
            reqFieldLimit,
            reqFieldOffset
        );

        if (!getResponse.success || getResponse.data == null || getResponse.data.length == 0) {
            res.json(new ReqResponse(false, "ERRCODE_POST_NOT_FOUND", null));
            return;
        }

        res.json(new ReqResponse(true, "", getResponse.data));
    }
}

export default PostGetBy;