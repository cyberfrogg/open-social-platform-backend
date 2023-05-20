import { Express, Request, Response } from "express";
import IRoute from "../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../utils/backend/DatabaseQueries";
import ReqResponse from '../../../../data/shared/reqResponse';
import { GetPostNodesCount, SanitizePostContent } from "../../../../utils/shared/postUtils";
import PostContentData from '../../../../data/shared/postcontent/postContentData';
import IsFieldValid from '../../../../utils/shared/fieldvalidation';
import { TextToSlug } from "../../../../utils/shared/stringutils";


class PostCreate implements IRoute {
    readonly path: string;
    readonly maxNodesPerPost: number;
    readonly databaseQueries: DatabaseQueries;

    constructor(path: string, databaseQueries: DatabaseQueries) {
        this.path = path;
        this.databaseQueries = databaseQueries;
        this.maxNodesPerPost = Number(process.env.POSTS_MAX_NODES);
    }

    async Initialize(expressApp: Express): Promise<void> {
        expressApp.post(this.path, this.Execute);
    }

    Execute = async (req: Request, res: Response) => {
        // retrieve fields
        const reqUserToken = req.body.token;
        const reqUserTitle = req.body.title;
        const reqPostContentRaw = req.body.postContentData;

        if (reqUserToken == null || reqUserToken == "" || reqPostContentRaw == null) {
            res.json(new ReqResponse(false, "ERRVALID_CANTBENULL", null))
            return;
        }

        const titleValidationResponse = IsFieldValid(reqUserTitle, "postTitle");
        if (!titleValidationResponse.success) {
            res.json(new ReqResponse(false, titleValidationResponse.message, null))
            return;
        }

        // check if user token is valid
        const sessionRow = await this.databaseQueries.SessionQueries.GetSessionByToken(reqUserToken);
        if (!sessionRow.success || sessionRow.data == null) {
            res.json(new ReqResponse(false, sessionRow.message, null))
            return;
        }
        const userId = sessionRow.data.UserId;

        // sanitize post
        let sanitizedPostContent: PostContentData;

        try {
            const reqPostContent = reqPostContentRaw as PostContentData;
            if (reqPostContent == undefined) {
                res.json(new ReqResponse(false, "ERRCODE_SANITIZE", null));
            }

            sanitizedPostContent = SanitizePostContent(reqPostContent);
            const nodesCount = GetPostNodesCount(sanitizedPostContent);

            if (nodesCount >= this.maxNodesPerPost) {
                res.json(new ReqResponse(false, "ERRCODE_POST_NODES_LIMITED", null));
                return;
            }
        }
        catch (e) {
            console.error("Failed to sanitize post. Message: " + e.message);
            res.json(new ReqResponse(false, "ERRCODE_SANITIZE", null));
            return;
        }

        // generate slug for title
        const titleSlug = TextToSlug(reqUserTitle);

        // insert post
        const postInsertResult = await this.databaseQueries.PostQueries.CreatePost(userId, reqUserTitle, titleSlug, sanitizedPostContent);
        if (!postInsertResult.success || postInsertResult.data == 0) {
            res.json(postInsertResult);
            return;
        }

        // get inserted post
        const insertedPostData = await this.databaseQueries.PostQueries.GetPostsBy("id", postInsertResult.data, "id", false, 1, 0);
        if (!insertedPostData.success || insertedPostData.data.length == 0) {
            res.json(new ReqResponse(false, "ERRCODE_UNKNOWN", null));
            return;
        }

        res.json(new ReqResponse(true, "", insertedPostData.data[0]))
    }
}

export default PostCreate;