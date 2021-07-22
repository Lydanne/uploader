import { optionHander } from "../utils/Function";
import { uuid } from "../utils/UniqueCode";
import { UploadHandler, FileMeta, UploadHook } from "../core/UploadHandler";

export class LocalChooseUploadHandlerOption {
  exts: string[] = [];
  count: number = 1;
  type: "all" | "video" | "image" | "file" = "all";
  cate?: Cate;
  size?: number = 1024 * 1024 * 3; // B, default 3MB
  prefix?: string = "";
}

export type RequestHandler = (
  files: UploadAliyunFile[]
) => Promise<string> | void;

export class LocalChooseUploadHandler extends UploadHandler {
  private _option: LocalChooseUploadHandlerOption;
  private _requestHandler: RequestHandler;

  constructor(
    option: LocalChooseUploadHandlerOption,
    requestHandler: RequestHandler
  ) {
    super();

    this.hook().on("error", console.error.bind(console));
    this._option = optionHander(option, new LocalChooseUploadHandlerOption());
    this._requestHandler = requestHandler;
  }

  name() {
    return "mini";
  }

  async upload() {
    const tempFiles = await selectFile.call(this);
    const files = transfromFileMeta.call(this, tempFiles);

    const uploadAliyunFiles = await transfromUploadAliyunFile.call(this, files);

    await this._requestHandler(uploadAliyunFiles);

    return files;

    async function selectFile() {
      if (!wx.canIUse("chooseMessageFile")) {
        throw new CantUseApiException("chooseMessageFile");
      }

      const { tempFiles } = await wx.chooseMessageFile({
        count: this._option.count,
        type: this._option.type,
        extension: this._option.exts,
      });

      return tempFiles;
    }
    function transfromFileMeta(
      tempFiles: WechatMiniprogram.ChooseFile[] = []
    ): FileMeta[] {
      if (tempFiles.length > this._option.count) {
        throw new VerifyFileException("count", tempFiles);
      }
      return tempFiles.map((tempFile) => {
        if (tempFile.size > this._option.size) {
          throw new VerifyFileException("size", tempFile);
        }
        if (tempFile.type !== this._option.type) {
          throw new VerifyFileException("type", tempFile);
        }
        let [_, ext] = tempFile.name.match(/.(\w+)$/);
        if (
          this._option.exts?.length &&
          !this._option.exts.includes(ext.toLowerCase())
        ) {
          throw new VerifyFileException("exts", tempFile);
        }
        return {
          size: tempFile.size,
          ext,
          name: tempFile.name,
          type: tempFile.type,
          path: tempFile.path,
          time: tempFile.time,
          urlPath: `${this._option.prefix}/${uuid()}.${ext}`,
        };
      });
    }
    function transfromUploadAliyunFile(files: FileMeta[]): UploadAliyunFile[] {
      const typeToCate = {
        all: "disk",
        video: "video",
        image: "img",
        file: "file",
      };
      const ossBucketMap = {
        record: "https://campusrecord.welife001.com",
        video: "https://campusvideo.welife001.com",
        img: "https://campus002.welife001.com",
        answer_img: "https://campus002.welife001.com",
        file: "https://campusfile.welife001.com",
        album: "https://album.welife001.com", //网盘相册
        disk: "https://disk.welife001.com", //网盘文件
      };

      return files.map((file) => {
        const cate = this._option.cate || typeToCate[file.type]; // 如果没有传入cate， 自动推算cate类型
        const url = ossBucketMap[cate] + file.urlPath;
        file.url = url;
        return {
          cate,
          url,
          file: file.path,
          new_name: file.urlPath.substr(1),
          size: file.size,
        };
      });
    }
  }

  option() {
    return this._option;
  }
}

type Cate =
  | "record"
  | "video"
  | "img"
  | "answer_img"
  | "file"
  | "album"
  | "disk";
export class UploadAliyunFile {
  // TODO: 这是是 `utils/uploadoss/uploadAliyun.js` uploadFile 第一个参数的类型
  //       目前的临时解决方案，之后封装了API之后修改
  cate: Cate;
  file: string;
  new_name: string;
  size: number;
  duration?: number;
}

export class CantUseApiException extends Error {
  readonly name: string = "CantUseApiException";
  type: string;
  constructor(api: string) {
    super(`Cant use ${api} because doesn't support it.`);
    this.type = api;
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

export class UploadFileException extends Error {
  readonly name: string = "ResponseStatusCodeException";
  type: string;
  result: WechatMiniprogram.UploadFileSuccessCallbackResult;
  constructor(res) {
    super(`http status ${res.statuCode} not 2xx.`);
    this.type = res.statuCode;
    this.result = res;
  }
}
