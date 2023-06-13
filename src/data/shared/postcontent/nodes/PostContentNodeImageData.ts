import IPostContentNodeData from "../IPostContentNodeData";

class PostContentNodeImageData implements IPostContentNodeData {
    type: string = "image"
    description: string = "";
    assetUuid: string = "";
    url: string = "";
    width: number = 0;
    height: number = 0;

    constructor(type: string, description: string, url: string, width: number, height: number) {
        this.type = type;
        this.description = description;
        this.url = url;
        this.width = width;
        this.height = height;
    }
}

export default PostContentNodeImageData;