class ReqResponse<TDataType> {
    success: boolean;
    message: string;
    data: TDataType;

    constructor(success: boolean, message: string, data?: TDataType) {
        this.success = success;
        this.message = message;
        this.data = arguments[2];
    }
}

export default ReqResponse;