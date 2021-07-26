import { UrlParser } from "./../utils/UrlParser";
import { optionHander, sleep } from "../utils/Function";
import {
  AboutException,
  FileMeta,
  UploadHandler,
  VerifyContentHandler,
  VerifyFileException,
} from "../core/UploadHandler";

export type CreateCodeHandler = () => Promise<string>;
export type RemoveCodeHandler = (code) => Promise<void> | void;
export type ReadAssetUrlHandler = (
  string
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
  // type: "all" | "video" | "image" | "file" = "all";
  // cate?: Cate;
  // size?: number = 1024 * 1024 * 3; // B, default 3MB
  // prefix?: string = "";
  maxReadAssetUrlTimes?: number = 1000; // 限制轮询次数
  sleepInterval?: number = 1000; // ms default 1s 轮询间隔
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
  private _aboutPool = false;
  constructor(option: RemoteUploadHandlerOption) {
    super(optionHander(option, new RemoteUploadHandlerOption()));
  }

  async upload(): Promise<FileMeta[]> {
    await this.option().removeCodeHandler(this._code);
    const code = await this.option().createCodeHandler();
    this._code = code;
    this.hook().asyncEmit(RemoteHook.CREATED_CODE, code);

    const urls = await pool.call(this);
    let files: FileMeta[] = transfromToFileMeta.call(this, urls);
    await verifyFile.call(this, files);

    return files;

    async function pool() {
      for (let i = 0; i < this._option.maxReadAssetUrlTimes; i++) {
        const urls = await this._option.readAssetUrlHandler(code);
        if (urls === false) {
          return [];
        }
        if (urls) {
          return urls;
        }
        if (this._aboutPool) {
          this._aboutPool = false;
          throw new AboutException();
        }

        await sleep(this._option.sleepInterval);
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
    this.option().removeCodeHandler(this._code);
  }

  about() {
    this._aboutPool = true;
  }
}
