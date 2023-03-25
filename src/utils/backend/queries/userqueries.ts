import { excuteQuery, executeTransaction } from "../mysqldb";
import ReqResponse from "../../../data/shared/reqResponse";
import UserRowData from '../../../data/user/userrowdata';
import IDatabaseQueryCollection from '../IDatabaseQueryCollection';

interface IUserQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    Create(nickname: string, email: string, passwordHash: string): Promise<ReqResponse<UserRowData>>;
    GetByID(id: number): Promise<ReqResponse<UserRowData>>;
}

class UserQueries implements IUserQueries {
    readonly Name: string = "UserQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    async Create(nickname: string, email: string, passwordHash: string): Promise<ReqResponse<UserRowData>> {
        let response = new ReqResponse<UserRowData>(false, "");

        try {
            const queryResult = await excuteQuery({
                query: "INSERT INTO `users` (`nickname`, `email`, `password`) VALUES (?, ?, ?);",
                values: [nickname, email, passwordHash]
            }) as any;

            console.log(queryResult);
            response.data = new UserRowData(queryResult.insertId, nickname, passwordHash, new Date(0));
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return response;
        }
    }

    async GetByID(id: number): Promise<ReqResponse<UserRowData>> {
        throw new Error("Method not implemented.");
    }
}

export { IUserQueries, UserQueries };