import IPostContentNodeData from "../IPostContentNodeData";
import PostContentNodeLinkData from "./PostContentNodeLinkData";
import PostContentNodeTextData from "./PostContentNodeTextData";

class PostContentNodeParagraphData implements IPostContentNodeData {
    type: string = "paragraph"
    innerNodes: Array<PostContentNodeTextData | PostContentNodeLinkData>

    constructor(type: string, innerNodes: Array<PostContentNodeTextData | PostContentNodeLinkData>) {
        this.type = type;
        this.innerNodes = innerNodes;
    }
}

export default PostContentNodeParagraphData;