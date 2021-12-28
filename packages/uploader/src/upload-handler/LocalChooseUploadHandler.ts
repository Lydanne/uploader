import { optionHander } from "../utils/Function";
import {
  UploadHandler,
  VerifyFileException,
  VerifyContentHandler,
  Cate,
} from "../core/UploadHandler";
import {
  UploadAliyunFile,
  transfromFileMeta,
  transfromUploadAliyunFile,
} from "src/utils/tools";

export class LocalChooseUploadHandlerOption {
  exts: string[] = []; // 限制文件后缀，最后会传给微信API
  count: number = 1; // 限制文件数量，最后会传给微信API
  type: "all" | "video" | "image" | "file" = "all"; // 类型，给微信API的
  cate?: Cate; // 会传给 aliyunOss 这个方法, 如果不传会通过type推算
  size?: number = 1024 * 1024 * 3; // B, default 3MB 限制大小
  prefix?: string = ""; // 资源路径前缀
  uploadFileHandler: uploadFileHandler; // 上传文件的钩子函数
  verifyContentHandler?: VerifyContentHandler = async () => true;
}

export type uploadFileHandler = (
  files: UploadAliyunFile[]
) => Promise<string> | void;
// 上传处理程序的约束

export class LocalChooseUploadHandler extends UploadHandler<LocalChooseUploadHandlerOption> {
  constructor(option: LocalChooseUploadHandlerOption) {
    super(optionHander(option, new LocalChooseUploadHandlerOption()));
  }

  async upload() {
    const self = this;
    const tempFiles = await selectFile();
    const files = transfromFileMeta(tempFiles, this.option());

    const uploadAliyunFiles = await transfromUploadAliyunFile(
      files,
      this.option()
    );

    await this.option().uploadFileHandler(uploadAliyunFiles);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!(await this.option().verifyContentHandler(file))) {
        throw new VerifyFileException("content", file);
      }
    }

    return files;

    async function selectFile() {
      if (!wx.canIUse("chooseMessageFile")) {
        throw new CantUseApiException("chooseMessageFile");
      }

      const { tempFiles } = await wx.chooseMessageFile({
        count: self.option().count,
        type: self.option().type,
        extension: self.option().exts,
      });

      return tempFiles;
    }
  }

  about() {}

  destroy() {}
}

export class CantUseApiException extends Error {
  readonly name: string = "CantUseApiException";
  type: string;
  constructor(api: string) {
    super(`Cant use ${api} because doesn't support it.`);
    this.type = api;
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
