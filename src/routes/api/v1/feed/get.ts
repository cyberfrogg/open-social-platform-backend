import { Express, Request, Response } from "express";
import RangeVal from "../../../../data/shared/rangeVal";
import DatabaseQueries from "../../../../utils/backend/DatabaseQueries";
import IRoute from "../../../../utils/backend/IRoute";
import GetUserByToken from '../../../../utils/backend/GetUserByToken';
import ReqResponse from '../../../../data/shared/reqResponse';
import UserRowData from '../../../../data/user/userrowdata';
import PostContentData from '../../../../data/shared/postcontent/postContentData';
import PostRowData from '../../../../data/post/postrowdata';

class FeedGet implements IRoute {
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
        const reqFieldToken = req.body.token;   // this field is optional, but rec system will be different tho
        const reqFieldWatchedPostsOffset = req.body.watchedpostsoffset;

        if (!Number.isInteger(reqFieldWatchedPostsOffset)) {
            res.json(new ReqResponse(false, "ERRCODE_INVALID_FIELD", new Array<PostRowData>()));
            return;
        }

        const user = await GetUserByToken(reqFieldToken, this.databaseQueries);
        const isUserLoggedIn = !user.success || user.data == null;

        let posts = new Array<PostRowData>();
        if (isUserLoggedIn) {
            posts = await this.GetPostsForUser(user.data, reqFieldWatchedPostsOffset);
        }
        else {
            posts = await this.GetGenericPosts(reqFieldWatchedPostsOffset);
        }

        if (posts.length == 0) {
            res.json(new ReqResponse(false, "ERRCODE_POST_NOT_FOUND", new Array<PostRowData>()));
            return;
        }

        res.json(new ReqResponse(true, "", posts));
    }

    // get posts if user logged in
    GetPostsForUser = async (user: UserRowData, watchedPosts: number): Promise<PostRowData[]> => {
        return await this.GetGenericPosts(watchedPosts);    // todo: make personalized feed
    }

    // get posts if user have no account
    GetGenericPosts = async (watchedPosts: number): Promise<PostRowData[]> => {
        let posts = new Array<PostRowData>();

        const postsResponse = await this.databaseQueries.PostQueries.GetPosts("create_time", false, 5, watchedPosts);

        if (!postsResponse.success || postsResponse.data.length == 0) {
            return posts;
        }

        posts = postsResponse.data;

        return posts;
    }
}

export default FeedGet;