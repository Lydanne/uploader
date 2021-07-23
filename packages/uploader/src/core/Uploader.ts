import { UploadHandler, UploadHook, HookCb, FileMeta } from "./UploadHandler";

export class Uploader<T extends UploadHandler> {
  private _uploadHandler: T;

  constructor(uploaderHandler: T) {
    this.loadUploadHandler(uploaderHandler);
    this._uploadHandler
      .hook()
      .on(UploadHook.ERROR, console.error.bind(console));
    this._uploadHandler.hook().asyncEmit(UploadHook.CREATED, this);
  }

  loadUploadHandler(uploaderHandler: T) {
    if (!(uploaderHandler instanceof UploadHandler)) {
      throw new Error("@sharedkit/Uploader: uploadHandler load error");
    }
    this._uploadHandler = uploaderHandler;
    return this;
  }

  upload(): Uploader<T> {
    this._uploadHandler
      .upload()
      .then((res) => {
        this._uploadHandler.hook().emit(UploadHook.UPLOADED, res, this);
        this._uploadHandler.hook().emit(UploadHook.WAIT, null, res);
      })
      .catch((err) => {
        this._uploadHandler.hook().emit(UploadHook.ERROR, err, this);
        this._uploadHandler.hook().emit(UploadHook.WAIT, err, null);
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

  wait(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.onceHook(UploadHook.WAIT, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  destroy(): void {
    this._uploadHandler.destroy();
    this._uploadHandler.hook().emit(UploadHook.DESTROYED);
    this._uploadHandler
      .hook()
      .events()
      .forEach((_, k) => this._uploadHandler.hook().remove(k));
    this._uploadHandler = null;
  }
}
