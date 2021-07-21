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
  name: string; // 文件名
  size: number; // 文件大小
  type: string; // 文件类型
  ext: string; // 文件扩展
  url?: string; // 文件在OSS上到位置
  path?: string; // 文件在本地到位置
  time?: number; // 文件在会话的时间
}

export type HookCb<T> = (data?: T, that?: Uploader<any>) => void;

export abstract class UploadHandler<CUH = any, H = CUH | UploadHook> {
  private _hook = new EventHub<H>();

  name(): string {
    throw new Error("Method not implemented.");
  }
  upload(): Promise<FileMeta[]> {
    throw new Error("Method not implemented.");
  }
  about(message?: string): void {
    throw new Error("Method not implemented.");
  }
  process(): number {
    throw new Error("Method not implemented.");
  }
  hook(): EventHub<H> {
    return this._hook;
  }
}
