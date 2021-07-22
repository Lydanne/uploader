import { FileMeta, UploadHandler } from "../core/UploadHandler";
export declare type CreateCodeHandler = () => Promise<string>;
export declare type ReadAssetUrlHandler = (string: any) => Promise<string[] | undefined | false>;
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
    createCodeHandler: CreateCodeHandler;
    readAssetUrlHandler: ReadAssetUrlHandler;
}
export declare class RemoteUploadHandler extends UploadHandler {
    private _option;
    constructor(option: RemoteUploadHandlerOption);
    name(): string;
    upload(): Promise<FileMeta[]>;
}
export {};
//# sourceMappingURL=RemoteUploadHandler.d.ts.map