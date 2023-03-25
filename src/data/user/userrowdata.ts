class UserRowData {
    ID: number;
    Nickname: string;
    Password: string;
    CreateTime: Date;

    constructor(id: number, nickname: string, password: string, createTime: Date) {
        this.ID = id;
        this.Nickname = nickname;
        this.Password = password;
        this.CreateTime = createTime;
    }
}

export default UserRowData;