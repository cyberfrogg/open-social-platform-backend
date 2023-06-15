import IDatabaseQueryCollection from "../IDatabaseQueryCollection";
import ReqResponse from "../../../data/shared/reqResponse";
import { excuteQuery } from "../mysqldb";
import UserAssetsRowData from "../../../data/user/assets/userassetsrowdata";

interface IUserAssetsQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    CreateEmpty(newUuid: string, userId: number): Promise<ReqResponse<string>>;
    UpdateAfterUpload(rowUuid: string, newAssetType: string, newContent: string): Promise<ReqResponse<undefined>>;
}

class UserAssetsQueries implements IUserAssetsQueries {

    readonly Name: string = "UserAssetsQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    CreateEmpty = async (newUuid: string, userId: number): Promise<ReqResponse<string>> => {
        let response = new ReqResponse<string>(false, "");

        try {
            await excuteQuery({
                query: "INSERT INTO `users` (`uuid`, `userid`) VALUES (?, ?);",
                values: [newUuid, userId]
            }) as any;

            response.data = newUuid;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<string>(false, "ERRCODE_UNKNOWN");
        }
    }

    UpdateAfterUpload = async (rowUuid: string, newAssetType: string, newContent: string): Promise<ReqResponse<undefined>> => {
        try {
            await excuteQuery({
                query: "UPDATE `users_meta` SET assettype=? content=? WHERE userid=?",
                values: [newAssetType, newContent, rowUuid]
            }) as any;

            return ReqResponse.Success();
        }
        catch (e) {
            console.error(e);
            return ReqResponse.Fail("ERRCODE_UNKNOWN");
        }
    }
}

export { IUserAssetsQueries, UserAssetsQueries };