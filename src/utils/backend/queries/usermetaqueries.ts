import { excuteQuery, executeTransaction } from "../mysqldb";
import ReqResponse from "../../../data/shared/reqResponse";
import IDatabaseQueryCollection from '../IDatabaseQueryCollection';
import UserMetaRowData from '../../../data/user/usermetarowdata';

const KEYNAME_LEN_MAX = 255;
const KEYNAME_LEN_MIN = 1;

interface IUserMetaQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
    Replace<TMetaValueType>(userid: number, keyname: string, value: TMetaValueType): Promise<ReqResponse<UserMetaRowData<TMetaValueType>>>;
    Delete(userid: number, keyname: string): Promise<ReqResponse<any>>;
    Get<TMetaValueType>(userid: number, keyname: string): Promise<ReqResponse<UserMetaRowData<TMetaValueType>>>;
    Exists(userid: number, keyname: string): Promise<ReqResponse<any>>;
}

class UserMetaQueries implements IUserMetaQueries {
    readonly Name: string = "UserMetaQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }

    async Replace<TMetaValueType>(userid: number, keyname: string, value: TMetaValueType): Promise<ReqResponse<UserMetaRowData<TMetaValueType>>> {
        let response = new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "");

        // validating keyname.
        if (keyname.length < KEYNAME_LEN_MIN || keyname.length > KEYNAME_LEN_MAX) {
            return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_KEYNAME_INVALID");
        }

        // parse object to json (try catch for fail catch)
        let valueJson = "";
        try {
            valueJson = JSON.stringify(value);
        }
        catch (je) {
            console.error(je);
            return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
        }

        if (valueJson == "") {     // empty should also fail. Just to be sure
            return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
        }

        // UPDATE row if exists
        const rowAlreadyExistsResult = await this.Exists(userid, keyname);
        if (rowAlreadyExistsResult.success && rowAlreadyExistsResult.data == true) { // check if ok & exists

            const queryResult = await excuteQuery({
                query: "UPDATE `users_meta` SET value=? WHERE userid=?; keyname=?;",
                values: [valueJson, userid, keyname]        // NEVER insert `value` from input.
            }) as any;

            response.data = new UserMetaRowData(queryResult.insertId, userid, keyname, value);
            response.success = true;
            return response;
        }
        else {        // if success == false || row doesnt exists
            if (!rowAlreadyExistsResult.success) {  // check if exists function failed
                return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, rowAlreadyExistsResult.message);
            }
        }

        // INSERT for users_meta row
        try {
            const queryResult = await excuteQuery({
                query: "INSERT INTO `users_meta` (`userid`, `keyname`, `value`) VALUES (?, ?, ?);",
                values: [userid, keyname, valueJson]        // NEVER insert `value` from input.
            }) as any;

            response.data = queryResult.insertId;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_UNKNOWN");
        }
    }

    async Delete(userid: number, keyname: string): Promise<ReqResponse<any>> {
        let response = new ReqResponse<number>(false, "");

        // validating keyname.
        if (keyname.length < KEYNAME_LEN_MIN || keyname.length > KEYNAME_LEN_MAX) {
            return new ReqResponse<number>(false, "ERRCODE_KEYNAME_INVALID", 0);
        }

        // DELETE row
        try {
            const queryResult = await excuteQuery({
                query: "DELETE FROM `users_meta` WHERE userid=? AND keyname=?",
                values: [userid, keyname]
            }) as any;

            if (queryResult.affectedRows == 0) {    // return error if nothing deleted
                return new ReqResponse<number>(false, "ERRCODE_USERMETA_NOTFOUND");
            }

            response.data = queryResult.affectedRows;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<number>(false, "ERRCODE_UNKNOWN");
        }
    }

    async Get<TMetaValueType>(userid: number, keyname: string): Promise<ReqResponse<UserMetaRowData<TMetaValueType>>> {
        let response = new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "");

        // validating keyname.
        if (keyname.length < KEYNAME_LEN_MIN || keyname.length > KEYNAME_LEN_MAX) {
            return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_KEYNAME_INVALID", null);
        }

        // SELECT for users_meta row
        try {
            const queryResult = await excuteQuery({
                query: "SELECT * FROM `users_meta WHERE userid = ? AND keyname = ?",
                values: [userid, keyname]
            }) as any;

            // if nothing found - return error
            if (queryResult.length == 0) {
                return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_USERMETA_DOESNT_EXISTS");
            }
            if (queryResult[0].id == undefined) {
                return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_USERMETA_DOESNT_EXISTS");
            }

            // parse json to object
            let valueJson: TMetaValueType = null;
            try {
                valueJson = JSON.parse(queryResult[0].value);
                if (valueJson == undefined || valueJson == null) {
                    return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
                }
            }
            catch (je) {
                console.error(je);
                return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_METAVALUE_JSON_FAIL");
            }

            // row as class
            const userMetaRowData = new UserMetaRowData(
                queryResult[0].id,
                queryResult[0].userid,
                queryResult[0].keyname,
                queryResult[0].value
            );

            response.data = userMetaRowData;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<UserMetaRowData<TMetaValueType>>(false, "ERRCODE_UNKNOWN");
        }
    }

    async Exists(userid: number, keyname: string): Promise<ReqResponse<boolean>> {
        let response = new ReqResponse<boolean>(false, "");

        // validating keyname.
        if (keyname.length < KEYNAME_LEN_MIN || keyname.length > KEYNAME_LEN_MAX) {
            return new ReqResponse<boolean>(false, "ERRCODE_KEYNAME_INVALID", null);
        }

        // SELECT for users_meta row
        try {
            const queryResult = await excuteQuery({
                query: "SELECT COUNT(*) FROM users_meta WHERE userid = ? AND keyname = ?;",
                values: [userid, keyname]
            }) as any;

            const queryCount = Object.values(queryResult[0])[0];

            response.data = queryCount != 0;
            response.success = true;
            return response;
        }
        catch (e) {
            console.error(e);
            return new ReqResponse<boolean>(false, "ERRCODE_UNKNOWN");
        }
    }
}

export { IUserMetaQueries, UserMetaQueries };