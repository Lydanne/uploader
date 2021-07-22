import { UrlParser } from "./../utils/UrlParser";
import { optionHander, sleep } from "../utils/Function";
import {
  FileMeta,
  UploadHandler,
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
  exts: string[] = [];
  count: number = 1;
  // type: "all" | "video" | "image" | "file" = "all";
  // cate?: Cate;
  // size?: number = 1024 * 1024 * 3; // B, default 3MB
  // prefix?: string = "";
  maxReadAssetUrlTimes?: number = 100;
  sleepInterval?: number = 1000; // ms default 1s
  createCodeHandler: CreateCodeHandler;
  removeCodeHandler: RemoveCodeHandler;
  readAssetUrlHandler: ReadAssetUrlHandler;
}

export enum RemoteHook {
  CREATED_CODE = "createdCode",
}

export class RemoteUploadHandler extends UploadHandler<RemoteHook> {
  private _option: RemoteUploadHandlerOption = new RemoteUploadHandlerOption();
  private _code: string;
  constructor(option: RemoteUploadHandlerOption) {
    super();
    this._option = optionHander(option, this._option);
  }

  name() {
    return "remote";
  }

  async upload(): Promise<FileMeta[]> {
    await this._option.removeCodeHandler(this._code);
    const code = await this._option.createCodeHandler();
    this._code = code;
    this.hook().asyncEmit(RemoteHook.CREATED_CODE, code);

    const urls = await pool.call(this);
    let files: FileMeta[] = transfromToFileMeta.call(this, urls);
    verifyFile(files);

    return files;

    async function pool() {
      for (let i = 0; i < this._option.maxReadAssetUrlTimes; i++) {
        const urls = await this._option.readAssetUrlHandler(code);
        if (urls) {
          return urls;
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

    function verifyFile(files: FileMeta[]) {
      if (files.length > this._option.count) {
        throw new VerifyFileException("count", files);
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!this._option.exts.includes(file.ext)) {
          throw new VerifyFileException("ext", file);
        }
      }
    }
  }

  destroy() {
    this._option.removeCodeHandler(this._code);
  }
}
