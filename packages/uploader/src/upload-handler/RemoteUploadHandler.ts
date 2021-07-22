import { optionHander, sleep } from "../utils/Function";
import { FileMeta, UploadHandler } from "../core/UploadHandler";

export type CreateCodeHandler = () => Promise<string>;
export type ReadAssetUrlHandler = (string) => Promise<string[]>;

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
  type: "all" | "video" | "image" | "file" = "all";
  cate?: Cate;
  size?: number = 1024 * 1024 * 3; // B, default 3MB
  prefix?: string = "";
  maxReadAssetUrlTimes?: number = 100;
  sleepInterval?: number = 1000; // ms default 1s
  createCodeHandler: CreateCodeHandler;
  readAssetUrlHandler: ReadAssetUrlHandler;
}

export class RemoteUploadHandler extends UploadHandler {
  private _option: RemoteUploadHandlerOption = new RemoteUploadHandlerOption();
  constructor(option: RemoteUploadHandlerOption) {
    super();
    this._option = optionHander(option, this._option);
  }

  name() {
    return "remote";
  }

  async upload(): Promise<FileMeta[]> {
    const code = await this._option.createCodeHandler();
    let files: FileMeta[] = [];

    for (let i = 0; i < this._option.maxReadAssetUrlTimes; i++) {
      const urls = await this._option.readAssetUrlHandler(code);
      if (urls) {
        files = urls.map((url) => ({
          url,
        }));
        break;
      }
      await sleep(this._option.sleepInterval);
    }
    return files;
  }
}
