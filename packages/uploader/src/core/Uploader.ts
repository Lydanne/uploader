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

  constructor(UploadHandler: UploadHandlerConstruction<O>, option?: O) {
    this._option = option;
    this.loadUploadHandler(UploadHandler, option);
    this._uploadHandler
      .hook()
      .on(UploadHook.ERROR, console.error.bind(console));
  }

  loadUploadHandler(UploadHandler: UploadHandlerConstruction<O>, option?: O) {
    this._option = optionHander(option, this._option);
    this._uploadHandler = new UploadHandler(this._option);

    if (!(this._uploadHandler instanceof UploadHandler)) {
      throw new Error("@sharedkit/Uploader: uploadHandler load error");
    }

    this._uploadHandler.hook().asyncEmit(UploadHook.CREATED, this);

    return this;
  }

  upload(option?: O): Uploader<O> {
    this._option = optionHander(option, this._option);
    this._uploadHandler.option(this._option);
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

  onHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O> {
    this._uploadHandler.hook().on(hook, cb);
    return this;
  }

  offHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O> {
    this._uploadHandler.hook().off(hook, cb);
    return this;
  }

  onceHook<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O> {
    this._uploadHandler.hook().once(hook, cb);
    return this;
  }
  /**
   * 等待Uplaoder上传完成
   * */
  wait(): Promise<FileMeta[]> {
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
