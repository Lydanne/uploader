import { FileMeta, UploadHandler } from "../core/UploadHandler";
export declare type CreateCodeHandler = () => Promise<string>;
export declare type RemoveCodeHandler = (code: any) => Promise<void> | void;
export declare type ReadAssetUrlHandler = (string: any) => Promise<string[] | undefined | false>;
export declare class RemoteUploadHandlerOption {
    exts: string[];
    count: number;
    maxReadAssetUrlTimes?: number;
    sleepInterval?: number;
    createCodeHandler: CreateCodeHandler;
    removeCodeHandler: RemoveCodeHandler;
    readAssetUrlHandler: ReadAssetUrlHandler;
}
export declare enum RemoteHook {
    CREATED_CODE = "createdCode"
}
export declare class RemoteUploadHandler extends UploadHandler<RemoteHook> {
    private _option;
    private _code;
    constructor(option: RemoteUploadHandlerOption);
    name(): string;
    upload(): Promise<FileMeta[]>;
    destroy(): void;
}
//# sourceMappingURL=RemoteUploadHandler.d.ts.map