import { FileMeta } from "@sharedkit/uploader/src/core/UploadHandler";
import { UploadHandler, UploadHook, HookCb } from "./UploadHandler";

export class Uploader<T extends UploadHandler> {
  private _uploadHandler: T;

  constructor(uploaderHandler: T) {
    if (!(uploaderHandler instanceof UploadHandler)) {
      throw new Error("@sharedkit/Uploader: uploadHandler load error");
    }
    this._uploadHandler = uploaderHandler;
    this._uploadHandler.hook().asyncEmit(UploadHook.CREATED, this);
  }

  async upload(): Promise<FileMeta[]> {
    try {
      const res = await this._uploadHandler.upload();
      this._uploadHandler.hook().emit(UploadHook.UPLOADED, res, this);
      return res;
    } catch (err) {
      this._uploadHandler.hook().emit(UploadHook.ERROR, err, this);
      return [];
    }
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
