import ReqResponse from '../../data/shared/reqResponse';
import RangeVal from '../../data/shared/rangeVal';

const NICKNAME_RANGE = new RangeVal(3, 30);
const NICKNAME_REGEX_TEST = /^[A-Za-z][A-Za-z0-9]*$/;

const EMAIL_RANGE = new RangeVal(3, 250);
const EMAIL_REGEX_TEST = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const PASSWORD_RANGE = new RangeVal(8, 50);

const IsFieldValid = (value: any, type: string) => {
    try {
        switch (type) {
            case "nickname":
                return validateNicknameField(value);
            case "email":
                return validateEmailField(value);
            case "password":
                return validatePasswordField(value);
            case "turnstileCaptchaToken":
                return validateIsNotEmptyField(value);
            case "verificationToken":
                return validateIsNotEmptyField(value);
            case "passwordResetToken":
                return validateIsNotEmptyField(value);
            case "nicknameOrEmail":
                return validateIsNotEmptyField(value);
            case "userid":
                return validateIsNotEmptyField(value);
            case "postid":
                return validateIsNotEmptyField(value);
            default:
                return new ReqResponse(false, "ERRCODE_VALIDATION_NO_TYPE", null);
        }
    } catch {
        return new ReqResponse(false, "ERRCODE_VALIDATION_FAIL", null);
    }
}

const validateNicknameField = (value: any): ReqResponse<any> => {
    try {
        if (value == undefined) {
            return new ReqResponse(false, "ERRVALID_CANTBENULL", null);
        }

        const nicknameString: string = value as string;

        if (!NICKNAME_RANGE.IsStringInRange(nicknameString)) {
            return new ReqResponse(false, "ERRVALID_NICKNAME_LEN", NICKNAME_RANGE);
        }

        if (!NICKNAME_REGEX_TEST.test(nicknameString)) {
            return new ReqResponse(false, "ERRVALID_NICKNAME_INVALIDCHARS", null);
        }

        return new ReqResponse(true, "", null);
    }
    catch {
        return new ReqResponse(false, "ERRVALID_INVALID", null);
    }
}

const validateEmailField = (value: any): ReqResponse<any> => {
    try {
        if (value == undefined) {
            return new ReqResponse(false, "ERRVALID_CANTBENULL", null);
        }

        const emailString: string = value as string;

        if (!EMAIL_RANGE.IsStringInRange(emailString)) {
            return new ReqResponse(false, "ERRVALID_EMAIL_LEN", EMAIL_RANGE);
        }

        if (!EMAIL_REGEX_TEST.test(emailString.toLowerCase())) {
            return new ReqResponse(false, "ERRVALID_EMAIL_INVALID", null);
        }

        return new ReqResponse(true, "", null);
    }
    catch {
        return new ReqResponse(false, "ERRVALID_INVALID", null);
    }
}

const validatePasswordField = (value: any): ReqResponse<any> => {
    try {
        if (value == undefined) {
            return new ReqResponse(false, "ERRVALID_CANTBENULL", null);
        }

        const passwordString: string = value as string;

        if (!PASSWORD_RANGE.IsStringInRange(passwordString)) {
            return new ReqResponse(false, "ERRVALID_PASSWORD_LEN", PASSWORD_RANGE);
        }

        return new ReqResponse(true, "", null);
    }
    catch {
        return new ReqResponse(false, "ERRVALID_INVALID", null);
    }
}

const validateIsNotEmptyField = (value: any): ReqResponse<any> => {
    try {
        if (value == undefined) {
            return new ReqResponse(false, "ERRVALID_CANTBENULL", null);
        }

        const tokenString: string = value as string;

        if (tokenString == "") {
            return new ReqResponse(false, "ERRVALID_CANTBENULL", null);
        }

        return new ReqResponse(true, "", null);
    }
    catch {
        return new ReqResponse(false, "ERRVALID_INVALID", null);
    }
}


export default IsFieldValid;