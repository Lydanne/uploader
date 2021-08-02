import { FileMeta, UploadHandler, VerifyContentHandler } from "../core/UploadHandler";
export declare type CreateCodeHandler = (uploadHandler: RemoteUploadHandler) => Promise<string>;
export declare type RemoveCodeHandler = (code: string, uploadHandler: RemoteUploadHandler) => Promise<void> | void;
export declare type ReadAssetUrlHandler = (code: string, uploadHandler: RemoteUploadHandler) => Promise<FileMeta[] | undefined | false>;
declare type Cate = "record" | "video" | "img" | "answer_img" | "file" | "album" | "disk";
export declare class RemoteUploadHandlerOption {
    exts: string[];
    count: number;
    type: "all" | "video" | "image" | "file";
    cate?: Cate;
    size?: number;
    prefix?: string;
    maxReadAssetUrlTimes?: number;
    sleepInterval?: number;
    maxAge?: number;
    createCodeHandler: CreateCodeHandler;
    removeCodeHandler: RemoveCodeHandler;
    readAssetUrlHandler: ReadAssetUrlHandler;
    verifyContentHandler: VerifyContentHandler;
}
export declare enum RemoteHook {
    CREATED_CODE = "createdCode"
}
export declare class RemoteUploadHandler extends UploadHandler<RemoteUploadHandlerOption, RemoteHook> {
    private _code;
    private _codeExpriedAt;
    private _aboutPool;
    constructor(option: RemoteUploadHandlerOption);
    upload(): Promise<FileMeta[]>;
    destroy(): void;
    about(): Promise<void>;
}
export {};
//# sourceMappingURL=RemoteUploadHandler.d.ts.map