import IDatabaseQueryCollection from "../IDatabaseQueryCollection";
import PostContentData from '../../../data/shared/postcontent/postContentData';
import ReqResponse from "../../../data/shared/reqResponse";
import { excuteQuery } from "../mysqldb";
import PostRowData from '../../../data/post/postrowdata';

interface IPostQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    CreatePost(authorId: number, title: string, slug: string, content: PostContentData): Promise<ReqResponse<number>>;
    GetPostsBy(columnname: string, value: string | number, orderByFieldname: string, isReverseOrder: boolean, limit: number, offset: number): Promise<ReqResponse<Array<PostRowData>>>;
    GetPosts(orderByFieldname: string, isReverseOrder: boolean, limit: number, offset: number): Promise<ReqResponse<Array<PostRowData>>>;
}

class PostQueries implements IPostQueries {
    readonly Name: string = "PostQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    async CreatePost(authorId: number, title: string, slug: string, content: PostContentData): Promise<ReqResponse<number>> {
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
                query: "INSERT INTO posts (authorid, title, slug, content) VALUES(?, ?, ?, ?)",
                values: [authorId, title, slug, contentJson]
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

    async GetPostsBy(columnname: string, value: string | number, orderByFieldname: string, isReverseOrder: boolean, limit: number, offset: number): Promise<ReqResponse<Array<PostRowData>>> {
        let response = new ReqResponse<Array<PostRowData>>(false, "", new Array<PostRowData>());

        // prevent mysql injection. i think
        if (!this.IsColumnNameValid(columnname) || !this.IsColumnNameValid(orderByFieldname)) {
            return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_INVALID_KEY");
        }

        // construct query
        const dbQuery = "SELECT * FROM `posts` WHERE " + columnname + " = ? ORDER BY " + orderByFieldname + " " + (isReverseOrder ? "ASC" : "DESC" + " " + "LIMIT ? OFFSET ?");



        try {
            const queryResult = await excuteQuery({
                query: dbQuery,
                values: [value, limit, offset]
            }) as any;

            response.success = true;

            // fetch to array
            let result = new Array<PostRowData>();
            for (let i = 0; i < queryResult.length; i++) {
                const item = queryResult[i];

                // parse json to object
                let content: PostContentData = null;
                try {
                    content = JSON.parse(item.content);
                    if (content == undefined || content == null) {
                        return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
                    }
                }
                catch (je) {
                    console.error(je);
                    return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
                }

                // create PostRowData
                let createTimeDate = new Date(item.create_time);
                let lastEditTimeDate = new Date(item.lastedit_time);
                let newItem = new PostRowData(
                    item.id,
                    item.authorid,
                    item.title,
                    item.slug,
                    content,
                    lastEditTimeDate,
                    createTimeDate
                );

                result.push(newItem);
            }

            response.data = result;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_UNKNOWN", null);
        }
    }

    async GetPosts(orderByFieldname: string, isReverseOrder: boolean, limit: number, offset: number): Promise<ReqResponse<Array<PostRowData>>> {
        let response = new ReqResponse<Array<PostRowData>>(false, "", new Array<PostRowData>());

        // prevent mysql injection. i think
        if (!this.IsColumnNameValid(orderByFieldname)) {
            return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_INVALID_KEY");
        }

        // construct query
        const dbQuery = "SELECT * FROM `posts` ORDER BY " + orderByFieldname + " " + (isReverseOrder ? "ASC" : "DESC" + " " + "LIMIT ? OFFSET ?");


        try {
            const queryResult = await excuteQuery({
                query: dbQuery,
                values: [limit, offset]
            }) as any;

            response.success = true;

            // fetch to array
            let result = new Array<PostRowData>();
            for (let i = 0; i < queryResult.length; i++) {
                const item = queryResult[i];

                // parse json to object
                let content: PostContentData = null;
                try {
                    content = JSON.parse(item.content);
                    if (content == undefined || content == null) {
                        return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
                    }
                }
                catch (je) {
                    console.error(je);
                    return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
                }

                // create PostRowData
                let createTimeDate = new Date(item.create_time);
                let lastEditTimeDate = new Date(item.lastedit_time);
                let newItem = new PostRowData(
                    item.id,
                    item.authorid,
                    item.title,
                    item.slug,
                    content,
                    lastEditTimeDate,
                    createTimeDate
                );

                result.push(newItem);
            }

            response.data = result;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<Array<PostRowData>>(false, "ERRCODE_UNKNOWN", null);
        }
    }

    IsColumnNameValid(columnname: string): boolean {
        switch (columnname) {
            case "id":
                break;
            case "authorid":
                break;
            case "title":
                break;
            case "slug":
                break;
            case "lastedit_time":
                break;
            case "create_time":
                break;
            default:
                return false;
        }

        return true;
    }
}

export { IPostQueries, PostQueries };