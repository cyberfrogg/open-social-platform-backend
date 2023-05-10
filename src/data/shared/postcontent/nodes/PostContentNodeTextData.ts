import IPostContentNodeData from "../IPostContentNodeData";

class PostContentNodeTextData implements IPostContentNodeData {
    type: string = "text"
    text: string

    constructor(type: string, text: string) {
        this.type = type;
        this.text = text;
    }
}

export default PostContentNodeTextData;