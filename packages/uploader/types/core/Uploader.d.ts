import { UploadHandler, UploadHook, HookCb, FileMeta } from "./UploadHandler";
export declare class Uploader<T extends UploadHandler> {
    private _uploadHandler;
    constructor(uploaderHandler: T);
    upload(): Promise<FileMeta[]>;
    onHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T>;
    offHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T>;
    onceHook<H extends UploadHook>(hook: H, cb?: HookCb<H>): Promise<unknown>;
    destroy(): void;
}
//# sourceMappingURL=Uploader.d.ts.map