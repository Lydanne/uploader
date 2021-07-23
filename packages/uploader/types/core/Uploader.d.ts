import { UploadHook, HookCb, UploadHandlerConstruction } from "./UploadHandler";
export declare class Uploader<O> {
    private _uploadHandler;
    private _option;
    constructor(UploadHandler: UploadHandlerConstruction<O>, option?: O);
    loadUploadHandler(UploadHandler: UploadHandlerConstruction<O>, option?: O): this;
    upload(): Uploader<O>;
    onHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    offHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    onceHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    wait(): Promise<any>;
    destroy(): void;
}
//# sourceMappingURL=Uploader.d.ts.map