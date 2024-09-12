/// <reference types="wechat-miniprogram" />
import { UploadHandler, VerifyContentHandler, Cate } from "../core/UploadHandler";
import { UploadAliyunFile } from "src/utils/tools";
export declare class LocalChooseUploadHandlerOption {
    exts: string[];
    count: number;
    type: "all" | "video" | "image" | "file";
    cate?: Cate;
    size?: number;
    prefix?: string;
    uploadFileHandler: uploadFileHandler;
    resolveHandler: resolveHandler;
    verifyContentHandler?: VerifyContentHandler;
}
export type uploadFileHandler = (files: UploadAliyunFile[]) => Promise<string> | void;
export type resolveHandler = (cate: Cate, key: string) => string;
export declare class LocalChooseUploadHandler extends UploadHandler<LocalChooseUploadHandlerOption> {
    constructor(option: LocalChooseUploadHandlerOption);
    upload(): Promise<import("../core/UploadHandler").FileMeta[]>;
    about(): void;
    destroy(): void;
}
export declare class CantUseApiException extends Error {
    readonly name: string;
    type: string;
    constructor(api: string);
}
export declare class UploadFileException extends Error {
    readonly name: string;
    type: string;
    result: WechatMiniprogram.UploadFileSuccessCallbackResult;
    constructor(res: any);
}
//# sourceMappingURL=LocalChooseUploadHandler.d.ts.map