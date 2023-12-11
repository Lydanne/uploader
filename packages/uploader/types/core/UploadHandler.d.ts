/// <reference types="wechat-miniprogram" />
import { EventHub } from "../utils/EventHub";
export declare enum UploadHook {
    CREATED = "created",// 创建完成后
    UPLOADED = "uploaded",//上传完成后
    ABOUT = "about",
    ERROR = "error",// 报错之后
    DESTROYED = "destroyed",// 销毁之后
    WAIT = "wait"
}
export type Cate = "record" | "video" | "img" | "answer_img" | "file" | "album" | "disk";
export type CreatedHookArg = string;
export type UploadedHookArg = FileMeta[];
export type AboutHookArg = {
    hook: UploadHook;
    process: number;
    message: string;
};
export type ErrorHookArg = Error;
export interface FileMeta {
    name?: string;
    size?: number;
    type?: string;
    ext?: string;
    url?: string;
    urlPath?: string;
    path?: string;
    resource?: string;
    time?: number;
    duration?: number;
    creatorName?: string;
    uploaded?: boolean;
    _raw_?: any;
}
export type HookCb<T> = (data?: T, that?: any) => void;
export interface UploadHandlerConstruction<T> {
    new (option?: T): UploadHandler<T>;
}
export declare abstract class UploadHandler<T, CUH = any, H = CUH | UploadHook> {
    private _hook;
    private _option;
    constructor(option: T);
    option(option?: T): T;
    /**
     * 获取事件处理器
     * @returns EventHub
     */
    hook(hook?: EventHub): EventHub<H>;
    /**
     * 需要重写的方法，如果不重写会报错，核心的上传方法
     * @returns Promise
     */
    upload(tempFiles?: WechatMiniprogram.ChooseFile[]): Promise<FileMeta[]>;
    /**
     * 需要重写的方法，如果不重写会报错，销毁方法
     * @returns void
     */
    destroy(): void;
    about(): void;
}
export declare class VerifyFileException extends Error {
    readonly name: string;
    type: string;
    file: WechatMiniprogram.ChooseFile;
    constructor(type: any, file: any);
}
export declare class AboutException extends Error {
    type: string;
    constructor();
}
export type VerifyContentHandler = (file: FileMeta) => Promise<boolean>;
//# sourceMappingURL=UploadHandler.d.ts.map