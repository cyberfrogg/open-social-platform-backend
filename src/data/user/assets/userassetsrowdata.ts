
class UserAssetsRowData {
    Uuid: string;
    UserId: number;
    AssetType: string;
    Content: string;
    CreateTime: Date;

    constructor(uuid: string, userid: number, assettype: string, content: string, createTime: Date) {
        this.Uuid = uuid;
        this.UserId = userid;
        this.AssetType = assettype;
        this.Content = content;
        this.CreateTime = createTime;
    }
}

export default UserAssetsRowData;