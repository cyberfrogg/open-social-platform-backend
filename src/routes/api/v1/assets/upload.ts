import { Express, Request, Response } from "express";
import IRoute from "../../../../utils/backend/IRoute";
import DatabaseQueries from "../../../../utils/backend/DatabaseQueries";
import ReqResponse from '../../../../data/shared/reqResponse';
import IImageUplaoder from "../../../../utils/backend/imageuploader/IImageUploader";
import { getContentBufferFromUploadedFile, getImageExtension, getUploadFileFromRequest } from "../../../../utils/backend/fileUtils";


// todo: support multiple asset types. like video. only images and gifs are supported now.
class AssetsUpload implements IRoute {
    readonly path: string;
    readonly maxNodesPerPost: number;
    readonly databaseQueries: DatabaseQueries;
    readonly imageUploader: IImageUplaoder;

    constructor(path: string, databaseQueries: DatabaseQueries, imageUploader: IImageUplaoder) {
        this.path = path;
        this.databaseQueries = databaseQueries;
        this.maxNodesPerPost = Number(process.env.POSTS_MAX_NODES);
        this.imageUploader = imageUploader;
    }

    async Initialize(expressApp: Express): Promise<void> {
        expressApp.post(this.path, this.Execute);
    }

    Execute = async (req: Request, res: Response) => {
        // retrieve fields
        const reqUserToken = req.body.token;
        const reqPostContentRaw = req.body.postContentData;

        if (reqUserToken == null || reqUserToken == "" || reqPostContentRaw == null) {
            res.json(new ReqResponse(false, "ERRVALID_CANTBENULL", null))
            return;
        }

        // check if user token is valid
        const sessionRow = await this.databaseQueries.SessionQueries.GetSessionByToken(reqUserToken);
        if (!sessionRow.success || sessionRow.data == null) {
            res.json(new ReqResponse(false, sessionRow.message, null))
            return;
        }
        const userId = sessionRow.data.UserId;

        // validate if file even uploaded
        const uploadedFile = getUploadFileFromRequest(req);

        if (uploadedFile == undefined || uploadedFile.data == undefined) {
            res.json(ReqResponse.Fail("ERRCODE_INVALID_FILE"));
            return;
        }

        const fileBinary = getContentBufferFromUploadedFile(uploadedFile)

        // validate is file an image
        const fileExtension = getImageExtension(fileBinary);
        if (fileExtension == undefined) {
            res.json(ReqResponse.Fail("ERRCODE_NOT_SUPPORTED"));
            return;
        }

        // upload image first
        const uploadResponse = await this.imageUploader.UploadImage(fileBinary);
        if (!uploadResponse.success) {
            res.json(ReqResponse.Fail("ERRCODE_UPLOAD_FAILED"));
            return;
        }

        // get new row uuid
        const nextRowUUidResponse = await this.databaseQueries.UtilsQueries.GetNextUuid();
        if (!nextRowUUidResponse.success) {
            res.json(ReqResponse.Fail("ERRCODE_UNKNOWN"));
            return;
        }

        // create row
        const createRowResponse = await this.databaseQueries.UserAssetsQueries.CreateEmpty(
            nextRowUUidResponse.data,
            userId
        );
        if (!createRowResponse.success) {
            res.json(ReqResponse.Fail("ERRCODE_UNKNOWN"));
            return;
        }

        // update created row data
        const updateRowResponse = await this.databaseQueries.UserAssetsQueries.UpdateAfterUpload(
            nextRowUUidResponse.data,
            "image",
            JSON.stringify(uploadResponse.data)
        );
        if (!updateRowResponse.success) {
            res.json(ReqResponse.Fail("ERRCODE_UNKNOWN"));
            return;
        }

        res.json(ReqResponse.Success(updateRowResponse));
    }
}

export default AssetsUpload;