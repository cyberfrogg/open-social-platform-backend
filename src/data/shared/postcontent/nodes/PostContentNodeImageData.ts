import IPostContentNodeData from "../IPostContentNodeData";

class PostContentNodeImageData implements IPostContentNodeData {
    type: string = "image"
    description: string
    url: string

    constructor(type: string, description: string, url: string) {
        this.type = type;
        this.description = description;
        this.url = url;
    }
}

export default PostContentNodeImageData;