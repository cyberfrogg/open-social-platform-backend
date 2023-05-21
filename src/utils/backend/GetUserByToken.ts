import ReqResponse from '../../data/shared/reqResponse';
import UserRowData from '../../data/user/userrowdata';
import DatabaseQueries from './DatabaseQueries';

const GetUserByToken = async (token: string, dbQueries: DatabaseQueries): Promise<ReqResponse<UserRowData>> => {
    if (token == undefined || token == "") {
        return new ReqResponse<UserRowData>(false, "ERRCODE_SESSION_NOT_FOUND", null);
    }

    const sessionResponse = await dbQueries.SessionQueries.GetSessionByToken(token);
    if (!sessionResponse.success) {
        return new ReqResponse<UserRowData>(false, sessionResponse.message, null);
    }

    const userResponse = await dbQueries.UserQueries.GetRowByID(sessionResponse.data.UserId);
    if (!userResponse.success) {
        return new ReqResponse<UserRowData>(false, userResponse.message, null);
    }

    return new ReqResponse(true, "", userResponse.data);
}

export default GetUserByToken;