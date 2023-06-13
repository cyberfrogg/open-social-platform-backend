import ReqResponse from "../../../../data/shared/reqResponse";
import IImageUplaoder from "../IImageUploader";
import ImageUploadData from "../ImageUploadData";
import ImgstazImageUploaderConfig from "./ImgstazImageUploaderConfig";

class ImgstazImageUpload implements IImageUplaoder {
    private readonly config: ImgstazImageUploaderConfig;

    constructor(config: ImgstazImageUploaderConfig) {
        this.config = config;
    }


    UploadImage = async (buffer: Buffer): Promise<ReqResponse<ImageUploadData>> => {
        try {
            const formData = new FormData();
            formData.append("uploadfile", new Blob([buffer]), "uploadfileanyext");
            formData.append("token", this.config.projectToken);

            const endpoint = process.env.IMGSTAZ_ENDPOINT + "image/uplaod"
            const response = await fetch(endpoint, { method: "POST", body: formData });

            if (response.status != 200) {
                console.error("Failed to complete request. Error: " + response.status + " msg: " + response.statusText);
                return ReqResponse.Fail("ERRCODE_UNKNOWN");
            }

            const json = (await response.json()) as ReqResponse<any>;
            if (!json.success) {
                console.error("Image processing failed. Error: " + json.message);
                return ReqResponse.Fail("ERRCODE_UNKNOWN");
            }

            let data = new ImageUploadData();
            data.width = json.data.width;
            data.imageUuid = json.data.imageUuid;
            data.url = json.data.location;
            data.height = json.data.height;
            return ReqResponse.Success(data);
        }
        catch (e) {
            console.error("Failed to upload image by base64. Error: ");
            console.error(e);
        }

        return ReqResponse.Fail("ERRCODE_UNKNOWN");
    }
}

export default ImgstazImageUpload;