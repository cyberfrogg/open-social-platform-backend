import IPostContentNodeData from "../IPostContentNodeData";

class PostContentNodeLinkData implements IPostContentNodeData {
    type: string = "link"
    text: string
    url: string

    constructor(type: string, text: string, url: string) {
        this.type = type;
        this.text = text;
        this.url = url;
    }
}

export default PostContentNodeLinkData;