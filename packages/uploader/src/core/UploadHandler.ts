import { EventHub } from "../utils/EventHub";

export enum UploadHook {
  CREATED = "created", // 创建完成后
  // BEFORE_UPLOAD = 'beforeUpload',
  UPLOADED = "uploaded", //上传完成后
  ABOUT = "about",
  ERROR = "error", // 报错之后
  // PROCESS = "process",
  DESTROYED = "destroyed", // 销毁之后
  WAIT = "wait", // 上传完成之后，无论成功或失败，与uploaded回调参数有不同
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

export type HookCb<T> = (data?: T, that?: any) => void;

export interface UploadHandlerConstruction<T> {
  new (option?: T): UploadHandler<T>;
}

export abstract class UploadHandler<T, CUH = any, H = CUH | UploadHook> {
  private _hook = new EventHub<H>();
  private _option: T;

  constructor(option: T) {
    this.option(option);
  }

  option(option?: T): T {
    if (option) {
      this._option = option;
    }
    return this._option;
  }

  /**
   * 获取事件处理器
   * @returns EventHub
   */
  hook(): EventHub<H> {
    return this._hook;
  }

  /**
   * 需要重写的方法，如果不重写会报错，核心的上传方法
   * @returns Promise
   */
  upload(): Promise<FileMeta[]> {
    throw new Error("Method not implemented.");
  }

  /**
   * 需要重写的方法，如果不重写会报错，销毁方法
   * @returns void
   */
  destroy() {
    throw new Error("Method not implemented.");
  }

  about() {
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

export type VerifyContentHandler = (file: FileMeta) => Promise<boolean>;
