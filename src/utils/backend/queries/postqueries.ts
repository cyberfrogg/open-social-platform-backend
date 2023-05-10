import IDatabaseQueryCollection from "../IDatabaseQueryCollection";
import PostContentData from '../../../data/shared/postcontent/postContentData';
import ReqResponse from "../../../data/shared/reqResponse";
import { excuteQuery } from "../mysqldb";

interface IPostQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    CreatePost(authorId: number, content: PostContentData): Promise<ReqResponse<number>>;
}

class PostQueries implements IPostQueries {
    readonly Name: string = "PostQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    async CreatePost(authorId: number, content: PostContentData): Promise<ReqResponse<number>> {
        let response = new ReqResponse<number>(false, "");

        // parse object to json (try catch for fail catch)
        let contentJson = "{}";
        try {
            contentJson = JSON.stringify(content);
        }
        catch (je) {
            console.error(je);
            return new ReqResponse<number>(false, "ERRCODE_METAVALUE_JSON_FAIL", 0);
        }

        // INSERT row 
        try {
            const queryResult = await excuteQuery({
                query: " INSERT INTO posts (authorid, content) VALUES(?, ?)",
                values: [authorId, contentJson]
            }) as any;

            if (queryResult == undefined || queryResult.insertId == undefined) {
                console.error(queryResult);
                return new ReqResponse<number>(false, "ERRCODE_UNKNOWN");
            }

            response.data = queryResult.insertId;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<number>(false, "ERRCODE_UNKNOWN");
        }
    }
}

export { IPostQueries, PostQueries };