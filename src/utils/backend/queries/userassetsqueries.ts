import IDatabaseQueryCollection from "../IDatabaseQueryCollection";
import ReqResponse from "../../../data/shared/reqResponse";
import { excuteQuery } from "../mysqldb";
import UserAssetsRowData from "../../../data/user/assets/userassetsrowdata";

interface IUserAssetsQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    Create(newUuid: string, userId: number, assetType: string, content: string): Promise<ReqResponse<UserAssetsRowData>>;
    GetAssetByUuid(uuid: string): Promise<ReqResponse<UserAssetsRowData>>;
    IsRateLimited(userId: number, timespanInDays: number, rateLimit: number): Promise<ReqResponse<boolean>>;
}

class UserAssetsQueries implements IUserAssetsQueries {

    readonly Name: string = "UserAssetsQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    Create = async (newUuid: string, userId: number, assetType: string, content: string): Promise<ReqResponse<UserAssetsRowData>> => {
        try {
            const result = await excuteQuery({
                query: "INSERT INTO `user_assets` (`uuid`, `userid`, `assettype`, `content`) VALUES (?, ?, ?, ?);",
                values: [newUuid, userId, assetType, content]
            }) as any;

            if (result.affectedRows == undefined || result.affectedRows == 0) {
                return ReqResponse.Fail("ERRCODE_UNKNOWN");
            }

            let data = new UserAssetsRowData(newUuid, userId, assetType, content, null);
            return ReqResponse.Success(data);
        }
        catch (e) {
            console.error(e);
            return ReqResponse.Fail("ERRCODE_UNKNOWN");
        }
    }

    GetAssetByUuid = async (uuid: string): Promise<ReqResponse<UserAssetsRowData>> => {
        const dbQuery = "SELECT * FROM `user_assets` WHERE uuid = ? ";

        try {
            const queryResult = await excuteQuery({
                query: dbQuery,
                values: [uuid]
            }) as any;

            if (queryResult.length == 0 || queryResult.length == undefined) {
                return ReqResponse.Fail("ERRCODE_NOT_FOUND");
            }

            const resultAsset = queryResult[0];

            if (resultAsset == undefined) {
                return ReqResponse.Fail("ERRCODE_UNKNOWN");
            }

            let data = new UserAssetsRowData(
                resultAsset.uuid,
                Number.parseInt(resultAsset.userid),
                resultAsset.assettype,
                resultAsset.content,
                new Date(resultAsset.create_time)
            );

            return ReqResponse.Success(data);
        }
        catch (e) {
            console.error(e);
            return ReqResponse.Fail("ERRCODE_UNKNOWN");
        }
    }

    IsRateLimited = async (userId: number, timespanInDays: number, rateLimit: number): Promise<ReqResponse<boolean>> => {
        try {
            const result = await excuteQuery({
                query: "SELECT COUNT(*) FROM user_assets WHERE userid = ? AND create_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY);",
                values: [userId, timespanInDays]
            }) as any;

            const rowsCount = Number.parseInt(result['COUNT(*)']);
            if (rowsCount == Number.NaN || rowsCount == null || rowsCount == undefined) {
                return ReqResponse.Fail("ERRCODE_UNKNOWN");
            }

            return ReqResponse.Success(rowsCount >= rateLimit);
        }
        catch (e) {
            console.error(e);
            return ReqResponse.Fail("ERRCODE_UNKNOWN");
        }
    }
}

export { IUserAssetsQueries, UserAssetsQueries };