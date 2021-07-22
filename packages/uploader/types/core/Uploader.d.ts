import { UploadHandler, UploadHook, HookCb } from "./UploadHandler";
export declare class Uploader<T extends UploadHandler> {
    private _uploadHandler;
    constructor(uploaderHandler: T);
    loadUploadHandler(uploaderHandler: T): this;
    upload(): Uploader<T>;
    onHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T>;
    offHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T>;
    onceHook<H extends UploadHook>(hook: H, cb?: HookCb<H>): Promise<unknown>;
    wait(): Promise<any>;
    destroy(): void;
}
//# sourceMappingURL=Uploader.d.ts.map