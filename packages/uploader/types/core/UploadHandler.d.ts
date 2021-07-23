/// <reference types="wechat-miniprogram" />
import { EventHub } from "../utils/EventHub";
export declare enum UploadHook {
    CREATED = "created",
    UPLOADED = "uploaded",
    ABOUT = "about",
    ERROR = "error",
    PROCESS = "process",
    DESTROYED = "destroyed",
    WAIT = "wait"
}
export declare type CreatedHookArg = string;
export declare type UploadedHookArg = FileMeta[];
export declare type AboutHookArg = {
    hook: UploadHook;
    process: number;
    message: string;
};
export declare type ErrorHookArg = Error;
export interface FileMeta {
    name?: string;
    size?: number;
    type?: string;
    ext?: string;
    url?: string;
    urlPath?: string;
    path?: string;
    time?: number;
}
export declare type HookCb<T> = (data?: T, that?: any) => void;
export interface UploadHandlerConstruction<T> {
    new (option?: T): UploadHandler<T>;
}
export declare abstract class UploadHandler<T, CUH = any, H = CUH | UploadHook> {
    private _hook;
    private _option;
    constructor(option: T);
    option(option?: T): T;
    hook(): EventHub<H>;
    upload(): Promise<FileMeta[]>;
    destroy(): void;
}
export declare class VerifyFileException extends Error {
    readonly name: string;
    type: string;
    file: WechatMiniprogram.ChooseFile;
    constructor(type: any, file: any);
}
//# sourceMappingURL=UploadHandler.d.ts.map