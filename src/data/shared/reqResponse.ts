class ReqResponse<TDataType> {
    success: boolean;
    message: string;
    data: TDataType;

    constructor(success: boolean, message: string, data?: TDataType) {
        this.success = success;
        this.message = message;
        this.data = arguments[2];
    }

    static Success<TDataType>(data?: TDataType): ReqResponse<TDataType> {
        return new ReqResponse(true, "", data);
    }

    static Fail<TDataType>(message: string, data?: TDataType): ReqResponse<TDataType> {
        return new ReqResponse(false, message, data);
    }
}

export default ReqResponse;