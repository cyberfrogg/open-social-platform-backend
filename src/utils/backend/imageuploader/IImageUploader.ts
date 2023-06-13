import ReqResponse from "../../../data/shared/reqResponse";
import ImageUploadData from "./ImageUploadData";

interface IImageUplaoder {
    UploadImage(buffer: Buffer): Promise<ReqResponse<ImageUploadData>>
}

export default IImageUplaoder;