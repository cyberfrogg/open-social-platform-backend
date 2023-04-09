class UserSessionRowData {
    Id: string;
    UserId: number;
    Token: string;
    CreateTime: Date;

    constructor(id: string, userId: number, token: string, createTime: Date) {
        this.Id = id;
        this.UserId = userId;
        this.Token = token;
        this.CreateTime = createTime;
    }
}

export default UserSessionRowData