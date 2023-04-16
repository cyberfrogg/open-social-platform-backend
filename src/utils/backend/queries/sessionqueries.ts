import IDatabaseQueryCollection from "../IDatabaseQueryCollection";
import ReqResponse from '../../../data/shared/reqResponse';
import UserSessionRowData from '../../../data/sessions/userSessionRowData';
import { excuteQuery } from "../mysqldb";

interface ISessionQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    CreateSession(userId: number): Promise<ReqResponse<number>>;
    GetSessionById(id: number): Promise<ReqResponse<UserSessionRowData>>;
    GetSessionByToken(token: string): Promise<ReqResponse<UserSessionRowData>>;
    GetSessionsByUser(userid: number, limit: number): Promise<ReqResponse<UserSessionRowData[]>>;
}

class SessionQueries implements ISessionQueries {
    readonly Name: string = "SessionQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    async CreateSession(userId: number): Promise<ReqResponse<number>> {
        const databaseName = process.env.DB_NAME;

        // fast and secure way to generate unique session token - famous last words
        const createSessionQuery = `
            INSERT INTO sessions (userid, token) 
            VALUES(
                ?,
                SHA2(
                    CONCAT(
                        (SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "sessions"),
                        (SELECT SUBSTR(MD5(RAND()), 1, 20) AS randomString)
                    ),
                    256
                )
            )
        `;

        let response = new ReqResponse<number>(false, "");

        try {
            const queryResult = await excuteQuery({
                query: createSessionQuery,
                values: [userId, databaseName]
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

    async GetSessionById(id: number): Promise<ReqResponse<UserSessionRowData>> {
        let response = new ReqResponse<UserSessionRowData>(false, "", null);

        try {
            const queryResult = await excuteQuery({
                query: "SELECT * FROM `sessions` WHERE id = ?",
                values: [id]
            }) as any;

            response.success = true;

            if (queryResult.length == 0 || queryResult[0] == undefined) {
                response.message = "ERRCODE_SESSION_DOESNT_EXISTS";
                return response;
            }
            if (queryResult[0].id == undefined) {
                response.message = "ERRCODE_SESSION_DOESNT_EXISTS";
                return response;
            }

            let createTimeDate = new Date(queryResult[0].create_time);
            let sessionRowData = new UserSessionRowData(
                queryResult[0].id,
                queryResult[0].userid,
                queryResult[0].token,
                createTimeDate
            );

            response.data = sessionRowData;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserSessionRowData>(false, "ERRCODE_UNKNOWN", null);
        }
    }

    async GetSessionByToken(token: string): Promise<ReqResponse<UserSessionRowData>> {
        let response = new ReqResponse<UserSessionRowData>(false, "", null);

        try {
            const queryResult = await excuteQuery({
                query: "SELECT * FROM `sessions` WHERE token = ?",
                values: [token]
            }) as any;

            response.success = true;

            if (queryResult.length == 0 || queryResult[0] == undefined) {
                response.message = "ERRCODE_SESSION_DOESNT_EXISTS";
                return response;
            }
            if (queryResult[0].id == undefined) {
                response.message = "ERRCODE_SESSION_DOESNT_EXISTS";
                return response;
            }

            let createTimeDate = new Date(queryResult[0].create_time);
            let sessionRowData = new UserSessionRowData(
                queryResult[0].id,
                queryResult[0].userid,
                queryResult[0].token,
                createTimeDate
            );

            response.data = sessionRowData;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserSessionRowData>(false, "ERRCODE_UNKNOWN", null);
        }
    }

    async GetSessionsByUser(userid: number, limit: number): Promise<ReqResponse<UserSessionRowData[]>> {
        let response = new ReqResponse<UserSessionRowData[]>(false, "", null);
        let resultArray = new Array<UserSessionRowData>();

        try {
            const queryResult = await excuteQuery({
                query: "SELECT * FROM `sessions` WHERE userid = ? LIMIT = ?",
                values: [userid, limit]
            }) as any;

            response.success = true;

            // check if even exists
            if (queryResult.length == 0 || queryResult[0] == undefined) {
                response.message = "ERRCODE_SESSION_DOESNT_EXISTS";
                response.data = resultArray;
                return response;
            }
            if (queryResult[0].id == undefined) {
                response.message = "ERRCODE_SESSION_DOESNT_EXISTS";
                response.data = resultArray;
                return response;
            }

            // parse mysql rows to result array
            for (let index = 0; index < queryResult.length; index++) {
                const element = queryResult[index];

                const parsedElementCreateTime = new Date(queryResult[0].create_time);
                const parsedElement = new UserSessionRowData(element.id, element.userid, element.token, parsedElementCreateTime);
                resultArray.push(parsedElement);
            }

            response.data = resultArray;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserSessionRowData[]>(false, "ERRCODE_UNKNOWN", null);
        }
    }
}

export { ISessionQueries, SessionQueries };