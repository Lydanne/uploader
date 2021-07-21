import { UploadHandler, UploadHook, HookCb } from "./UploadHandler";

export interface UploaderConstructor<T extends UploadHandler = UploadHandler> {
  upload(): Uploader<T>; // 开始导入
  about(message?: string): Uploader<T>; // 中断导入
  process(): number; // 获取导入进度
  onHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T>; // 监听钩子
  offHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T>;
  onceHook<H extends UploadHook>(hook: H, cb: HookCb<H>): void;
  onceHook<H extends UploadHook>(hook: H): Promise<any>;
  destroy(): void;
}

export class Uploader<T extends UploadHandler>
  implements UploaderConstructor<T>
{
  private _uploadHandler: T;

  constructor(uploaderHandler: T) {
    if (!(uploaderHandler instanceof UploadHandler)) {
      throw new Error("@sharedkit/Uploader: uploadHandler load error");
    }
    this._uploadHandler = uploaderHandler;
    this._uploadHandler.hook().asyncEmit(UploadHook.CREATED, this);
  }

  upload(): Uploader<T> {
    this._uploadHandler
      .upload()
      .then((res) => {
        this._uploadHandler.hook().emit(UploadHook.UPLOADED, res, this);
      })
      .catch((err) => {
        this._uploadHandler.hook().emit(UploadHook.ERROR, err, this);
      });
    return this;
  }

  about(message?: string): Uploader<T> {
    this._uploadHandler.hook().emit(UploadHook.ABOUT, message, this);
    this._uploadHandler.about();
    return this;
  }

  process(): number {
    return this._uploadHandler.process();
  }
  onHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T> {
    this._uploadHandler.hook().on(hook, cb);
    return this;
  }

  offHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<T> {
    this._uploadHandler.hook().off(hook, cb);
    return this;
  }

  onceHook<H extends UploadHook>(hook: H, cb?: HookCb<H>) {
    if (cb) {
      this._uploadHandler.hook().once(hook, cb);
      return;
    }
    return new Promise((resolve) => {
      this._uploadHandler.hook().once(hook, resolve);
    });
  }
  destroy(): void {
    this.about();
    this._uploadHandler.hook().emit(UploadHook.DESTROYED);
    this._uploadHandler
      .hook()
      .events()
      .forEach((_, k) => this._uploadHandler.hook().remove(k));
    this._uploadHandler = null;
  }
}
