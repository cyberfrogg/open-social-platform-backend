import IDatabaseQueryCollection from "../IDatabaseQueryCollection";
import ReqResponse from "../../../data/shared/reqResponse";
import { excuteQuery } from "../mysqldb";

interface IUtilsQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    GetNextUuid(): Promise<ReqResponse<string>>;
}

class UtilsQueries implements IUtilsQueries {
    readonly Name: string = "UtilsQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    GetNextUuid = async (): Promise<ReqResponse<string>> => {
        const queryResponse = await excuteQuery({
            query: "SELECT UUID() AS UUID_Value",
            values: []
        }) as any;

        try {
            const uuid = queryResponse[0]["UUID_Value"];
            return ReqResponse.Success(uuid);
        }
        catch (e) {
            console.error("Failed to get next UUID");
            console.error(e);
            return ReqResponse.Fail(queryResponse.message);
        }
    }
}

export { IUtilsQueries, UtilsQueries };