import { optionHander } from "../utils/Function";
import {
  UploadHandler,
  VerifyFileException,
  VerifyContentHandler,
  Cate,
} from "../core/UploadHandler";
import { uploadFileHandler, type resolveHandler } from "src";
import {
  spurl2,
  transfromFileMeta,
  transfromUploadAliyunFile,
} from "../utils/tools";

export class LocalUploadHandlerOption {
  exts: string[] = []; // 限制文件后缀，最后会传给微信API
  count: number = 1; // 限制文件数量，最后会传给微信API
  type: "all" | "video" | "image" | "file" = "all"; // 类型，给微信API的
  cate?: Cate; // 会传给 aliyunOss 这个方法, 如果不传会通过type推算
  size?: number = 1024 * 1024 * 3; // B, default 3MB 限制大小
  prefix?: string = ""; // 资源路径前缀
  uploadFileHandler: uploadFileHandler; // 上传文件的钩子函数
  resolveHandler: resolveHandler; // 路径拼接函数
  verifyContentHandler?: VerifyContentHandler = async () => true;
}

export class LocalUploadHandler extends UploadHandler<LocalUploadHandlerOption> {
  constructor(option: LocalUploadHandlerOption) {
    super(optionHander(option, new LocalUploadHandlerOption()));
  }

  async upload(tempFiles?: WechatMiniprogram.ChooseFile[]) {
    const self = this;
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
      const aliFile = uploadAliyunFiles[i];
      file.urlPath = spurl2(aliFile.new_name);
      file.url = spurl2(file.urlPath, (key) =>
        this.option().resolveHandler(aliFile.cate, key)
      );
      file.resource = file.urlPath;
      file.uploaded = aliFile.uploaded;
    }

    return files;
  }

  about() {}

  destroy() {}
}
