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
    DeleteCompletlyByID(id: number): Promise<ReqResponse<boolean>>;
    UpdatePasswordById(id: number, newPasswordHash: string): Promise<ReqResponse<boolean>>;
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

            let createTimeDate = new Date(queryResult[0].create_time);
            let userRowData = new UserRowData(
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

    async DeleteCompletlyByID(id: number): Promise<ReqResponse<boolean>> {
        let response = new ReqResponse<boolean>(false, "", false);

        try {
            let isTransactionError = false;
            // queries should be ordered relativly to foregn keys hierarchy in db
            let results = await executeTransaction()
                .query("DELETE FROM `sessions` WHERE userid=?", [id])
                .query("DELETE FROM `users_meta` WHERE userid=?", [id])
                .query("DELETE FROM `users` WHERE id=?", [id])
                .rollback(e => { console.error(e); isTransactionError = true; })
                .commit()

            if (isTransactionError) {
                console.error("UserQueries - DeleteCompletlyByID - Transaction error");
                return new ReqResponse<boolean>(false, "ERRCODE_USER_DELETE_FAILED", false);
            }

            // always should take the last result with deleting user
            const affectedDeleteAffectedRows = results[results.length - 1].affectedRows;

            response.data = affectedDeleteAffectedRows >= 1;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<boolean>(false, "ERRCODE_UNKNOWN", false);
        }
    }

    async UpdatePasswordById(id: number, newPasswordHash: string): Promise<ReqResponse<boolean>> {
        let response = new ReqResponse<boolean>(false, "", false);

        try {
            const queryResult = await excuteQuery({
                query: "UPDATE `users` SET password=? WHERE id=?",
                values: [newPasswordHash, id]
            }) as any;

            response.data = queryResult.affectedRows >= 1;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<boolean>(false, "ERRCODE_UNKNOWN");
        }
    }
}

export { IUserQueries, UserQueries };