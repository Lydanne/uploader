import { optionHander } from "../utils/Function";

import {
  UploadHandler,
  UploadHook,
  HookCb,
  FileMeta,
  UploadHandlerConstruction,
} from "./UploadHandler";

export class Uploader<O> {
  private _uploadHandler: UploadHandler<O>;
  private _option: O;

  /**
   * @param  {UploadHandlerConstruction<O>} UploadHandler // 传输器
   * @param  {O} option? 传给 UploadHandler 的选项
   */
  constructor(UploadHandler: UploadHandlerConstruction<O>, option?: O) {
    this.loadUploadHandler(UploadHandler, option);
    this._uploadHandler
      .hook()
      .on(UploadHook.ERROR, console.error.bind(console));
  }

  /**
   * 同上
   * @param  {UploadHandlerConstruction<O>} UploadHandler
   * @param  {O} option?
   * @returns Uploader
   */
  loadUploadHandler(
    UploadHandler: UploadHandlerConstruction<O>,
    option?: O
  ): Uploader<O> {
    let hook = null;
    if (this._uploadHandler) {
      this._uploadHandler.about();
      hook = this._uploadHandler.hook();
    }
    this._option = optionHander(option, this._option);
    this._uploadHandler = new UploadHandler(this._option);
    this._uploadHandler.hook(hook);

    if (!(this._uploadHandler instanceof UploadHandler)) {
      throw new Error("@sharedkit/Uploader: uploadHandler load error");
    }

    this._uploadHandler.hook().asyncEmit(UploadHook.CREATED, this);

    return this;
  }

  /**
   * 开始上传
   * @returns Uploader
   */
  upload(): Uploader<O> {
    this._uploadHandler
      .upload()
      .then((res) => {
        this._uploadHandler.hook().emit(UploadHook.UPLOADED, res);
        this._uploadHandler.hook().emit(UploadHook.WAIT, null, res);
      })
      .catch((err) => {
        this._uploadHandler.hook().emit(UploadHook.ERROR, err);
        this._uploadHandler.hook().emit(UploadHook.WAIT, err, null);
      });
    return this;
  }

  /**
   * 监听一个钩子
   * @param  {H} hook 钩子类型
   * @param  {HookCb<H>} cb 回调函数
   * @returns Uploader
   */
  on<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O> {
    this._uploadHandler.hook().on(hook, cb);
    return this;
  }

  /**
   * 移除一个钩子
   * @param  {H} hook
   * @param  {HookCb<H>} cb
   * @returns Uploader
   */
  off<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O> {
    this._uploadHandler.hook().off(hook, cb);
    return this;
  }

  /**
   * 监听一个钩子, 但只监听一次
   * @param  {H} hook 钩子类型
   * @param  {HookCb<H>} cb 回调函数
   * @returns Uploader
   */
  once<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O> {
    this._uploadHandler.hook().once(hook, cb);
    return this;
  }

  /**
   * 等待Uplaoder上传完成
   * */
  wait(): Promise<FileMeta[]> {
    return new Promise((resolve, reject) => {
      this.once(UploadHook.WAIT, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  /**
   * 获取或者修改选项
   * @param  {O} option? 传入的选项
   */
  option(option?: O) {
    return this._uploadHandler.option(option);
  }

  /**
   * 销毁
   * @returns void
   */
  destroy(): void {
    this._uploadHandler.destroy();
    this._uploadHandler.hook().emit(UploadHook.DESTROYED);
    this._uploadHandler
      .hook()
      .events()
      .forEach((_, k) => this._uploadHandler.hook().remove(k));
    this._uploadHandler = null;
  }

  about(): Uploader<O> {
    this._uploadHandler.about();
    this._uploadHandler.hook().emit(UploadHook.ABOUT);
    return this;
  }
}
