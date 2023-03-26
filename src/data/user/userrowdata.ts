class UserRowData {
    ID: number;
    Nickname: string;
    Email: string;
    Password: string;
    CreateTime: Date;

    constructor(id: number, nickname: string, email: string, password: string, createTime: Date) {
        this.ID = id;
        this.Nickname = nickname;
        this.Email = email;
        this.Password = password;
        this.CreateTime = createTime;
    }

    NoEmail(): UserRowData {
        return new UserRowData(this.ID, this.Nickname, null, this.Password, this.CreateTime);
    }

    NoPassword(): UserRowData {
        return new UserRowData(this.ID, this.Nickname, this.Email, null, this.CreateTime);
    }
}

export default UserRowData;