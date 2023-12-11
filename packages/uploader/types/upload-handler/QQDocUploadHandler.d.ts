import { FileMeta, UploadHandler, VerifyContentHandler } from "../core/UploadHandler";
import { uploadFileHandler } from "./LocalChooseUploadHandler";
export type OAuthHandlerRes = {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    refresh_token: string;
    user_id: string;
    scope: string;
    client_id: string;
};
export type OAuthHandler = (oAuthHandlerRes?: OAuthHandlerRes) => Promise<OAuthHandlerRes>;
export declare class QQDocUploadHandlerOption {
    exts: string[];
    count: number;
    type: "file";
    prefix?: string;
    transfer?: boolean;
    oauthHandler: OAuthHandler;
    selectFileView?: (fetch: (type: "next") => Promise<FileMeta[]>) => Promise<FileMeta[]>;
    verifyContentHandler: VerifyContentHandler;
    uploadFileHandler: uploadFileHandler;
}
export declare enum QQDocHook {
    GET_TOKEN_OK = "getTokenOk",
    BEFORE_FILTER = "beforeFilter",
    AFTER_FILTER = "afterFilter",
    TRANSFER_OK = "transferOk",
    TRANSFER_BEGIN = "transferBegin",
    TRANSFER_END = "transferEnd",
    TRANSFER_ING = "transferIng"
}
/**
 * 腾讯文档上传处理器
 */
export declare class QQDocUploadHandler extends UploadHandler<QQDocUploadHandlerOption, QQDocHook> {
    private _token;
    private _aboutPool;
    constructor(option: QQDocUploadHandlerOption);
    upload(): Promise<FileMeta[]>;
    private transfer;
    private driveFilter;
    private request;
    destroy(): void;
    about(): Promise<void>;
}
//# sourceMappingURL=QQDocUploadHandler.d.ts.map