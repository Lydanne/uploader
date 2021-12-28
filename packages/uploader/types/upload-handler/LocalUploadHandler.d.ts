/// <reference types="wechat-miniprogram" />
import { UploadHandler, VerifyContentHandler, Cate } from "../core/UploadHandler";
import { uploadFileHandler } from "src";
export declare class LocalUploadHandlerOption {
    exts: string[];
    count: number;
    type: "all" | "video" | "image" | "file";
    cate?: Cate;
    size?: number;
    prefix?: string;
    uploadFileHandler: uploadFileHandler;
    verifyContentHandler?: VerifyContentHandler;
}
export declare class LocalUploadHandler extends UploadHandler<LocalUploadHandlerOption> {
    constructor(option: LocalUploadHandlerOption);
    upload(tempFiles?: WechatMiniprogram.ChooseFile[]): Promise<import("src").FileMeta[]>;
    about(): void;
    destroy(): void;
}
//# sourceMappingURL=LocalUploadHandler.d.ts.map