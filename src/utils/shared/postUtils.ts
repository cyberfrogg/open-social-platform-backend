import PostContentData from '../../data/shared/postcontent/postContentData';
import PostContentNodeParagraphData from '../../data/shared/postcontent/nodes/PostContentNodeParagraphData';
import IPostContentNodeData from '../../data/shared/postcontent/IPostContentNodeData';
import PostContentNodeImageData from '../../data/shared/postcontent/nodes/PostContentNodeImageData';
import { sanitizeUrl } from '@braintree/sanitize-url';
import PostContentNodeTextData from '../../data/shared/postcontent/nodes/PostContentNodeTextData';
import PostContentNodeLinkData from '../../data/shared/postcontent/nodes/PostContentNodeLinkData';
import IImageUplaoder from '../backend/imageuploader/IImageUploader';
import { IUserAssetsQueries } from '../backend/queries/userassetsqueries';
import ImageUploadData from '../backend/imageuploader/ImageUploadData';

const GetPostNodesCount = (postContentData: PostContentData): number => {
    let count = 0;

    postContentData.nodes.forEach((node, index, array) => {

        switch (node.type) {
            case "paragraph":
                (node as PostContentNodeParagraphData).innerNodes.forEach((paragraphNode, index, array) => {
                    count++;
                });
                break;
            default:
                count++;
                break;
        }
    });

    return count;
}

// technically, we just re-assemble PostContentData here
const SanitizePostContent = (rawPostContentData: PostContentData): PostContentData | null => {
    let postContentData = new PostContentData();
    postContentData.nodes = new Array<IPostContentNodeData>();

    rawPostContentData.nodes.forEach((node, index, array) => {
        switch (node.type) {
            case "paragraph":
                try {
                    let oldParagraphNode = node as PostContentNodeParagraphData;
                    let newParagraphNode = new PostContentNodeParagraphData(oldParagraphNode.type, new Array<PostContentNodeTextData | PostContentNodeLinkData>());

                    // sanitize paragraph node
                    oldParagraphNode.innerNodes.forEach((pNode, pIndex, pArray) => {
                        switch (pNode.type) {
                            case "text":
                                let oldPTextNode = pNode as PostContentNodeTextData;
                                let newPTextNode = new PostContentNodeTextData(pNode.type, SanitizeText(oldPTextNode.text));
                                newParagraphNode.innerNodes.push(newPTextNode);
                                break;
                            case "link":
                                let oldPLinkNode = pNode as PostContentNodeLinkData;
                                let newPLinkNode = new PostContentNodeLinkData(pNode.type, SanitizeText(oldPLinkNode.text), sanitizeUrl(oldPLinkNode.url));
                                newParagraphNode.innerNodes.push(newPLinkNode);
                                break;
                            default:
                                break;
                        }
                    });
                    postContentData.nodes.push(newParagraphNode);
                }
                catch (e) {
                    console.error("Failed to sanitize post content at node. Message: " + e.message);
                }
                break;
            case "image":
                try {

                    let oldImageNode = node as PostContentNodeImageData;
                    let newImageNode = new PostContentNodeImageData(
                        node.type,
                        oldImageNode.assetUuid,
                        SanitizeText(oldImageNode.description),
                        "",
                        0,
                        0
                    );
                    newImageNode.assetUuid = oldImageNode.assetUuid;

                    if (newImageNode.assetUuid != "")
                        postContentData.nodes.push(newImageNode);
                }
                catch (e) {
                    console.error("Failed to sanitize post content at node. Message" + e.message);
                }
                break;
            default:
                break;
        }
    });

    return postContentData;
}

const PrepareUserUploadedAssets = async (rawPostContentData: PostContentData, queries: IUserAssetsQueries): Promise<PostContentData | null> => {
    let postContentData = new PostContentData();
    postContentData.nodes = new Array<IPostContentNodeData>();

    for (let i = 0; i < rawPostContentData.nodes.length; i++) {
        const node = rawPostContentData.nodes[i];
        switch (node.type) {
            case "image":
                try {
                    let oldImageNode = node as PostContentNodeImageData;
                    let imageRowResponse = await queries.GetAssetByUuid(oldImageNode.assetUuid);

                    if (imageRowResponse.success && imageRowResponse.data.AssetType == "image") {
                        const imageRowContent = JSON.parse(imageRowResponse.data.Content) as ImageUploadData;
                        let newImageNode = new PostContentNodeImageData(
                            node.type,
                            oldImageNode.assetUuid,
                            SanitizeText(oldImageNode.description),
                            imageRowContent.url,
                            imageRowContent.width,
                            imageRowContent.height
                        );
                        newImageNode.assetUuid = oldImageNode.assetUuid;

                        postContentData.nodes.push(newImageNode);
                    } else {
                        console.error("Failed to get image asset. Response: ");
                        console.error(imageRowResponse);
                    }
                }
                catch (e) {
                    console.error("Failed to setup image. Message: ");
                    console.error(e);
                }
                break;
            default:
                postContentData.nodes.push(node);
                break;
        }
    }

    return postContentData;
}

const SanitizeText = (rawText: string): string => {
    if (rawText == undefined) {
        return "";
    }

    const map = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    };

    const reg = /[&<>"'/]/ig;
    return rawText.replace(reg, (match) => (map[match]));
}

export { GetPostNodesCount, SanitizePostContent, PrepareUserUploadedAssets }