import PostContentData from "../shared/postcontent/postContentData";

class PostRowData {
    ID: number;
    AuthorID: number;
    Title: string;
    Slug: string;
    Content: PostContentData;
    LastEditTime: Date;
    CreateTime: Date;

    constructor(id: number, authorid: number, title: string, slug: string, content: PostContentData, lastEditTime: Date, createTime: Date) {
        this.ID = id;
        this.AuthorID = authorid;
        this.Title = title;
        this.Slug = slug;
        this.Content = content;
        this.LastEditTime = lastEditTime;
        this.CreateTime = createTime;
    }
}

export default PostRowData;