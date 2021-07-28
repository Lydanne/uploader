import { UrlParser } from "./../utils/UrlParser";
import { optionHander, sleep } from "../utils/Function";
import {
  AboutException,
  FileMeta,
  UploadHandler,
  VerifyContentHandler,
  VerifyFileException,
} from "../core/UploadHandler";

export type CreateCodeHandler = (
  uploadHandler: RemoteUploadHandler
) => Promise<string>;
export type RemoveCodeHandler = (
  code: string,
  uploadHandler: RemoteUploadHandler
) => Promise<void> | void;
export type ReadAssetUrlHandler = (
  code: string,
  uploadHandler: RemoteUploadHandler
) => Promise<string[] | undefined | false>;

type Cate =
  | "record"
  | "video"
  | "img"
  | "answer_img"
  | "file"
  | "album"
  | "disk";

export class RemoteUploadHandlerOption {
  exts: string[] = []; // 限制文件后缀
  count: number = 1; // 限制文件数量
  type: "all" | "video" | "image" | "file" = "all";
  cate?: Cate;
  size?: number = 1024 * 1024 * 3; // B, default 3MB
  prefix?: string = "";
  maxReadAssetUrlTimes?: number = 3000; // 限制轮询次数    - 弃用选项，请使用maxAge
  sleepInterval?: number = 1000; // ms default 1s 轮询间隔 - 弃用选项，请使用maxAge
  maxAge?: number = 5 * 60; // s default 5分钟 + Code过期时间
  createCodeHandler: CreateCodeHandler; // 创建传输码的钩子
  removeCodeHandler: RemoveCodeHandler; // 移除传输码的钩子
  readAssetUrlHandler: ReadAssetUrlHandler; // 读取传输码的钩子
  verifyContentHandler: VerifyContentHandler = async () => true; // 验证文件内容
}

export enum RemoteHook {
  CREATED_CODE = "createdCode",
}

export class RemoteUploadHandler extends UploadHandler<
  RemoteUploadHandlerOption,
  RemoteHook
> {
  private _code: string;
  private _codeExpriedAt: number; // 过期时间
  private _aboutPool = false;
  constructor(option: RemoteUploadHandlerOption) {
    super(optionHander(option, new RemoteUploadHandlerOption()));
  }

  async upload(): Promise<FileMeta[]> {
    await this.option().removeCodeHandler(this._code, this);

    const urls = await pool.call(this);
    let files: FileMeta[] = transfromToFileMeta.call(this, urls);
    await verifyFile.call(this, files);

    return files;
    async function pool() {
      let isPool = true;
      while (isPool) {
        const code = await this.option().createCodeHandler(this);
        this._codeExpriedAt = Date.now() + this.option().maxAge * 1000;
        this.hook().emit(RemoteHook.CREATED_CODE, code);
        this._code = code;
        while (this._codeExpriedAt >= Date.now()) {
          if (this._aboutPool) {
            this._aboutPool = false;
            isPool = false; // 这里其实没必要
            throw new AboutException();
          }
          const urls = await this._option.readAssetUrlHandler(code, this);
          if (urls === false) {
            return [];
          }
          if (urls) {
            return urls;
          }
          await sleep(1000);
        }
      }
      return [];
    }

    function transfromToFileMeta(urls) {
      return urls.map((url) => {
        return {
          url,
          ext: UrlParser.ext(url),
        };
      });
    }

    async function verifyFile(files: FileMeta[]) {
      if (files.length > this._option.count) {
        throw new VerifyFileException("count", files);
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!this._option.exts.includes(file.ext)) {
          throw new VerifyFileException("ext", file);
        }
        if (!(await this.option().verifyContentHandler(file))) {
          throw new VerifyFileException("content", file);
        }
      }
    }
  }

  destroy() {
    this.about();
    this.option().removeCodeHandler(this._code, this);
  }

  about() {
    this._aboutPool = true;
  }
}
