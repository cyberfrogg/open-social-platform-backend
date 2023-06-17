class ImgstazImageUploaderConfig {
    projectUuid: string;
    projectToken: string;
    uploadEndpoint: string;

    constructor(projectUuid: string, projectToken: string, uploadEndpoint: string) {
        this.projectUuid = projectUuid;
        this.projectToken = projectToken;
        this.uploadEndpoint = uploadEndpoint;
    }
}

export default ImgstazImageUploaderConfig;