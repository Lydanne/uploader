/// <reference types="wechat-miniprogram" />
import { UploadHandler, UploadHook, HookCb, FileMeta, UploadHandlerConstruction } from "./UploadHandler";
export declare class Uploader<O> {
    private _uploadHandler;
    private _option;
    private _isRun;
    /**
     * @param  {UploadHandlerConstruction<O>} UploadHandler // 传输器
     * @param  {O} option? 传给 UploadHandler 的选项
     */
    constructor(UploadHandler: UploadHandlerConstruction<O>, option?: O);
    /**
     * 同上
     * @param  {UploadHandlerConstruction<O>} LoadUploadHandler
     * @param  {O} option?
     * @returns Uploader
     */
    loadUploadHandler(LoadUploadHandler: UploadHandlerConstruction<O>, option?: O): Uploader<O>;
    /**
     * 开始上传
     * @returns Uploader
     */
    upload(tempFiles?: WechatMiniprogram.ChooseFile[]): Uploader<O>;
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
    uploadHandler(handler: UploadHandlerConstruction<O>): UploadHandler<O, any, any>;
}
//# sourceMappingURL=Uploader.d.ts.map