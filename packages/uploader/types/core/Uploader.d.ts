import { UploadHook, HookCb, FileMeta, UploadHandlerConstruction } from "./UploadHandler";
export declare class Uploader<O> {
    private _uploadHandler;
    private _option;
    /**
     * @param  {UploadHandlerConstruction<O>} UploadHandler // 传输器
     * @param  {O} option? 传给 UploadHandler 的选项
     */
    constructor(UploadHandler: UploadHandlerConstruction<O>, option?: O);
    /**
     * 同上
     * @param  {UploadHandlerConstruction<O>} UploadHandler
     * @param  {O} option?
     * @returns Uploader
     */
    loadUploadHandler(UploadHandler: UploadHandlerConstruction<O>, option?: O): Uploader<O>;
    /**
     * 开始上传
     * @returns Uploader
     */
    upload(): Uploader<O>;
    /**
     * 监听一个钩子
     * @param  {H} hook 钩子类型
     * @param  {HookCb<H>} cb 回调函数
     * @returns Uploader
     */
    on<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    /**
     * 移除一个钩子
     * @param  {H} hook
     * @param  {HookCb<H>} cb
     * @returns Uploader
     */
    off<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    /**
     * 监听一个钩子, 但只监听一次
     * @param  {H} hook 钩子类型
     * @param  {HookCb<H>} cb 回调函数
     * @returns Uploader
     */
    once<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    /**
     * 等待Uplaoder上传完成
     * */
    wait(): Promise<FileMeta[]>;
    /**
     * 获取或者修改选项
     * @param  {O} option? 传入的选项
     */
    option(option?: O): O;
    /**
     * 销毁
     * @returns void
     */
    destroy(): void;
    about(): Uploader<O>;
}
//# sourceMappingURL=Uploader.d.ts.map