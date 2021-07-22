import { UrlParser } from "./../utils/UrlParser";
import { optionHander, sleep } from "../utils/Function";
import { FileMeta, UploadHandler } from "../core/UploadHandler";

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
    let files: FileMeta[] = [];

    for (let i = 0; i < this._option.maxReadAssetUrlTimes; i++) {
      const urls = await this._option.readAssetUrlHandler(code);
      if (urls) {
        files = urls.map((url) => {
          let ext = UrlParser.ext(url);

          return {
            url,
            ext,
          };
        });
        break;
      }
      await sleep(this._option.sleepInterval);
    }
    return files;
  }

  destroy() {
    this._option.removeCodeHandler(this._code);
  }
}
