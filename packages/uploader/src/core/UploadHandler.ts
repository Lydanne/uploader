import { EventHub } from "../utils/EventHub";
import { Uploader } from "./Uploader";

export enum UploadHook {
  CREATED = "created",
  // BEFORE_UPLOAD = 'beforeUpload',
  UPLOADED = "uploaded",
  ABOUT = "about",
  ERROR = "error",
  PROCESS = "process",
  DESTROYED = "destroyed",
}

export type CreatedArg = string; // type 上传类型, 是UploaderHandler.name()的返回值
export type BeforeUploadArg = FileMeta[];
export type UploadArg = FileMeta[];
export type AboutArg = { hook: UploadHook; process: number; message: string };
export type ErrorArg = Error; // 错误信息
export type ProcessArg = number; // 当前进度，0-100

export interface FileMeta {
  name: string;
  size: number;
  type: string;
  ext: string;
  url?: string;
  path?: string;
  time?: number;
}

export interface UploadHandlerConstructor {
  name(): string; // 上传类型
  upload(): Promise<FileMeta[]>; // 上传，这个方法会在 beforeUpload 的时候自动调用
  about(): void;
  process(): number;
}

export type HookCb<T> = (data?: T, that?: Uploader<any>) => void;

export abstract class UploadHandler<CUH = any, H = CUH | UploadHook>
  implements UploadHandlerConstructor
{
  private _hook = new EventHub<H>();

  name(): string {
    throw new Error("Method not implemented.");
  }
  upload(): Promise<FileMeta[]> {
    throw new Error("Method not implemented.");
  }
  about(): void {
    throw new Error("Method not implemented.");
  }
  process(): number {
    throw new Error("Method not implemented.");
  }
  hook(): EventHub<H> {
    return this._hook;
  }
}
