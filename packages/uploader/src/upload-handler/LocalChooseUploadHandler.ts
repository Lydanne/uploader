import { optionHander } from "../utils/Function";
import { UploadHandler, FileMeta, UploadHook } from "../core/UploadHandler";
import { uuid } from "../utils/UniqueCode";

export class OssSTSOption {
  OSSAccessKeyId: string; // 可以直接从STS拿到
  policy: string; // 可以直接从STS拿到
  Signature: string; // 可以直接从STS拿到
  key?: string = ""; // 不填
  success_action_status?: string = "200"; // 不填
}

export class OssOption {
  STS = new OssSTSOption();
  url: string;
  name?: string = "file";
}

export class LocalChooseUploadHandlerOption {
  oss = new OssOption();
  exts: string[] = [];
  count: number = 1;
  type: "all" | "video" | "image" | "file" = "all";
  size?: number = 1024 * 1024 * 3; // B, default 3MB
}

export class LocalChooseUploadHandler extends UploadHandler {
  private _option: LocalChooseUploadHandlerOption;
  private _uploadTask: WechatMiniprogram.UploadTask;

  constructor(option: LocalChooseUploadHandlerOption) {
    super();

    this.hook().on("error", console.error.bind(console));
    this._option = optionHander(option, new LocalChooseUploadHandlerOption());
  }

  name() {
    return "mini";
  }

  async upload() {
    const tempFiles = await selectFile.call(this);
    const files = transfromFileMeta.call(this, tempFiles);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res =
        await new Promise<WechatMiniprogram.UploadFileSuccessCallbackResult>(
          (resolve, reject) => {
            this._uploadTask = wx.uploadFile({
              url: this._option.oss.url,
              filePath: file.path,
              formData: this._option.oss.STS,
              name: this._option.oss.name,
              success: resolve,
              fail: reject,
            });
            this._uploadTask.onProgressUpdate((process) => {
              this.hook().emit(UploadHook.PROCESS, { file, process });
            });
          }
        );

      if (Math.floor(res.statusCode / 100) !== 2) {
        throw new UploadFileException(res);
      }
      file.url = `${this._option.oss.url}/${uuid()}.${file.ext}`;
    }

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
        };
      });
    }
  }

  about(message?: string): void {
    this._uploadTask.abort();
    this.hook().emit(UploadHook.ABOUT, message);
  }

  option() {
    return this._option;
  }
}

class CantUseApiException extends Error {
  readonly name: string = "CantUseApiException";
  type: string;
  constructor(api: string) {
    super(`Cant use ${api} because doesn't support it.`);
    this.type = api;
  }
}

class VerifyFileException extends Error {
  readonly name: string = "VerifyFileException";
  type: string;
  file: WechatMiniprogram.ChooseFile;
  constructor(type, file) {
    super(`File ${type} no pass verify.`);
    this.type = type;
    this.file = file;
  }
}

class UploadFileException extends Error {
  readonly name: string = "ResponseStatusCodeException";
  type: string;
  result: WechatMiniprogram.UploadFileSuccessCallbackResult;
  constructor(res) {
    super(`http status ${res.statuCode} not 2xx.`);
    this.type = res.statuCode;
    this.result = res;
  }
}
