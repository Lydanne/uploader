import { EventHub } from "../utils/EventHub";
import { Uploader } from "./Uploader";
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
export declare type HookCb<T> = (data?: T, that?: Uploader<any>) => void;
export declare abstract class UploadHandler<CUH = any, H = CUH | UploadHook> {
    private _hook;
    name(): string;
    upload(): Promise<FileMeta[]>;
    hook(): EventHub<H>;
    destroy(): void;
}
//# sourceMappingURL=UploadHandler.d.ts.map