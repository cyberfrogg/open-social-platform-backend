import PostContentData from "../shared/postcontent/postContentData";

class PostRowData {
    ID: number;
    AuthorID: number;
    Content: PostContentData;
    LastEditTime: Date;
    CreateTime: Date;

    constructor(id: number, authorid: number, content: PostContentData, lastEditTime: Date, createTime: Date) {
        this.ID = id;
        this.AuthorID = authorid;
        this.Content = content;
        this.LastEditTime = lastEditTime;
        this.CreateTime = createTime;
    }
}

export default PostRowData;