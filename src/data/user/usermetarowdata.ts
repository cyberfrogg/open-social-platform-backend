class UserMetaRowData<TUserMetaValueData> {
    ID: number;
    UserID: number;
    Keyname: string;
    Value: TUserMetaValueData;

    constructor(id: number, userid: number, keyname: string, value?: TUserMetaValueData) {
        this.ID = id;
        this.UserID = userid;
        this.Keyname = keyname;
        this.Value = arguments[3];
    }
}

export default UserMetaRowData;