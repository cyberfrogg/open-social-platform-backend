import { excuteQuery, executeTransaction } from "../mysqldb";
import ReqResponse from "../../../data/shared/reqResponse";
import UserRowData from '../../../data/user/userrowdata';
import IDatabaseQueryCollection from '../IDatabaseQueryCollection';

interface IUserQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    Create(nickname: string, email: string, passwordHash: string): Promise<ReqResponse<number>>;
    GetRowByID(id: number): Promise<ReqResponse<UserRowData>>;
    GetRowByNickname(nickname: string): Promise<ReqResponse<UserRowData>>;
    GetRowByEmail(email: string): Promise<ReqResponse<UserRowData>>;
}

class UserQueries implements IUserQueries {
    readonly Name: string = "UserQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    async Create(nickname: string, email: string, passwordHash: string): Promise<ReqResponse<number>> {
        let response = new ReqResponse<number>(false, "");

        try {
            const queryResult = await excuteQuery({
                query: "INSERT INTO `users` (`nickname`, `email`, `password`) VALUES (?, ?, ?);",
                values: [nickname, email, passwordHash]
            }) as any;

            response.data = queryResult.insertId;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<number>(false, "ERRCODE_UNKNOWN");
        }
    }

    async GetRowByID(id: number): Promise<ReqResponse<UserRowData>> {
        let response = new ReqResponse<UserRowData>(false, "", null);

        try {
            const queryResult = await excuteQuery({
                query: "SELECT * FROM `users` WHERE id = ?",
                values: [id]
            }) as any;

            response.success = true;

            if (queryResult.length == 0) {
                response.message = "ERRCODE_USER_DOESNT_EXISTS";
                return response;
            }
            if (queryResult[0].id == undefined) {
                response.message = "ERRCODE_USER_DOESNT_EXISTS";
                return response;
            }

            var createTimeDate = new Date(queryResult[0].create_time);
            var userRowData = new UserRowData(
                queryResult[0].id,
                queryResult[0].nickname,
                queryResult[0].email,
                queryResult[0].password,
                createTimeDate
            );

            response.data = userRowData;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserRowData>(false, "ERRCODE_UNKNOWN", null);
        }
    }

    async GetRowByNickname(nickname: string): Promise<ReqResponse<UserRowData>> {
        let response = new ReqResponse<UserRowData>(false, "", null);

        try {
            const queryResult = await excuteQuery({
                query: "SELECT * FROM `users` WHERE nickname = ?",
                values: [nickname]
            }) as any;

            response.success = true;

            if (queryResult.length == 0) {
                response.message = "ERRCODE_USER_DOESNT_EXISTS";
                return response;
            }
            if (queryResult[0].id == undefined) {
                response.message = "ERRCODE_USER_DOESNT_EXISTS";
                return response;
            }

            var createTimeDate = new Date(queryResult[0].create_time);
            var userRowData = new UserRowData(
                queryResult[0].id,
                queryResult[0].nickname,
                queryResult[0].email,
                queryResult[0].password,
                createTimeDate
            );

            response.data = userRowData;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserRowData>(false, "ERRCODE_UNKNOWN", null);
        }
    }

    async GetRowByEmail(email: string): Promise<ReqResponse<UserRowData>> {
        let response = new ReqResponse<UserRowData>(false, "", null);

        try {
            const queryResult = await excuteQuery({
                query: "SELECT * FROM `users` WHERE email = ?",
                values: [email]
            }) as any;

            response.success = true;

            if (queryResult.length == 0) {
                response.message = "ERRCODE_USER_DOESNT_EXISTS";
                return response;
            }
            if (queryResult[0].id == undefined) {
                response.message = "ERRCODE_USER_DOESNT_EXISTS";
                return response;
            }

            var createTimeDate = new Date(queryResult[0].create_time);
            var userRowData = new UserRowData(
                queryResult[0].id,
                queryResult[0].nickname,
                queryResult[0].email,
                queryResult[0].password,
                createTimeDate
            );

            response.data = userRowData;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserRowData>(false, "ERRCODE_UNKNOWN", null);
        }
    }
}

export { IUserQueries, UserQueries };