import { UploadHandler, UploadHook, HookCb, FileMeta } from "./UploadHandler";

export class Uploader<T extends UploadHandler> {
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
        this._uploadHandler.hook().asyncEmit(UploadHook.WAIT, null, res);
        this._uploadHandler.hook().emit(UploadHook.UPLOADED, res, this);
      })
      .catch((err) => {
        this._uploadHandler.hook().asyncEmit(UploadHook.WAIT, err, null);
        this._uploadHandler.hook().emit(UploadHook.ERROR, err, this);
      });
    return this;
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

  wait<H extends UploadHook>(hook: H): Promise<any> {
    return new Promise((resolve, reject) => {
      this.onceHook(hook, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  destroy(): void {
    this._uploadHandler.hook().emit(UploadHook.DESTROYED);
    this._uploadHandler
      .hook()
      .events()
      .forEach((_, k) => this._uploadHandler.hook().remove(k));
    this._uploadHandler = null;
  }
}
