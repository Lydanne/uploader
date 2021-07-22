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
  WAIT = "wait",
}

export type CreatedHookArg = string; // type 上传类型, 是UploaderHandler.name()的返回值
// export type BeforeUploadHookArg = FileMeta[];
export type UploadedHookArg = FileMeta[];
export type AboutHookArg = {
  hook: UploadHook;
  process: number;
  message: string;
};
export type ErrorHookArg = Error; // 错误信息

export interface FileMeta {
  name?: string; // 文件名
  size?: number; // 文件大小
  type?: string; // 文件类型
  ext?: string; // 文件扩展
  url?: string; // 文件在OSS的完整地址
  urlPath?: string; // 文件在OSS的上除去域名的部分
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
  hook(): EventHub<H> {
    return this._hook;
  }
  destroy() {
    throw new Error("Method not implemented.");
  }
}

export class VerifyFileException extends Error {
  readonly name: string = "VerifyFileException";
  type: string;
  file: WechatMiniprogram.ChooseFile;
  constructor(type, file) {
    super(`File ${type} no pass verify.`);
    this.type = type;
    this.file = file;
  }
}
