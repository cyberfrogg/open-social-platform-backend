import { UploadedFile } from "express-fileupload";
import { Request } from "express";

const allowedImageFormats = {
    'jpg': 'ffd8ffe0',
    'png': '89504e47',
    'gif': '47494638'
};

const getFileExtension = (filename: string): string => {
    const res = filename.split('.').pop();

    if (res == undefined || res == null || res == "") {
        return "";
    }

    return res.toLowerCase();
}

// magic number solution: https://stackoverflow.com/questions/8473703/in-node-js-given-a-url-how-do-i-check-whether-its-a-jpg-png-gif/8475542#8475542
const getImageExtension = (buffer: Buffer): string | undefined => {
    const magigNumberInBody = buffer.toString('hex', 0, 4);

    for (const [key, value] of Object.entries(allowedImageFormats)) {
        if (magigNumberInBody == value) {
            return key;
        }
    }

    return undefined;
}

const getUploadFileFromRequest = (req: Request): UploadedFile | undefined => {
    let uploadFile: UploadedFile = undefined;
    try {
        uploadFile = req.files.uploadfile as UploadedFile;
    } catch { }

    return uploadFile;
}

const getContentBufferFromUploadedFile = (uploadedFile: UploadedFile): Buffer => {
    const fileContentString = uploadedFile.data.toString("base64");
    return Buffer.from(fileContentString, "base64");
}

export {
    getFileExtension,
    getImageExtension,
    getUploadFileFromRequest,
    getContentBufferFromUploadedFile,
    allowedImageFormats
}