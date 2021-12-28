import { Cate, FileMeta, VerifyFileException } from "../core/UploadHandler";
import { uuid } from "./UniqueCode";
import { UrlParser } from "./UrlParser";

export function transfromFileMeta(
  tempFiles: WechatMiniprogram.ChooseFile[] = [],
  option: any
): FileMeta[] {
  if (tempFiles.length > option.count) {
    throw new VerifyFileException("count", tempFiles);
  }
  return tempFiles.map((tempFile) => {
    if (tempFile.size > option.size) {
      throw new VerifyFileException("size", tempFile);
    }
    if (tempFile.type !== option.type) {
      throw new VerifyFileException("type", tempFile);
    }
    let ext = UrlParser.ext(tempFile.name);
    if (option.exts?.length && !option.exts.includes(ext.toLowerCase())) {
      throw new VerifyFileException("exts", tempFile);
    }
    const resource = `${uuid()}_cos.${ext}`;
    return {
      size: tempFile.size,
      ext,
      name: tempFile.name,
      type: tempFile.type,
      path: tempFile.path,
      time: tempFile.time,
      urlPath: `${option.prefix}/${resource}`,
      resource,
    };
  });
}

export function transfromUploadAliyunFile(
  files: FileMeta[],
  option: any
): UploadAliyunFile[] {
  const typeToCate = {
    all: "disk",
    video: "video",
    image: "img",
    file: "file",
  };
  const ossBucketMap = {
    // record: "https://campusrecord.welife001.com",
    // video: "https://campusvideo.welife001.com",
    // img: "https://campus002.welife001.com",
    // file: "https://campusfile.welife001.com",
    answer_img: "https://campus002.welife001.com",
    album: "https://album.welife001.com", //网盘相册
    disk: "https://disk.welife001.com", //网盘文件
    record: "https://record.banjixiaoguanjia.com",
    video: "https://video.banjixiaoguanjia.com",
    img: "https://img.banjixiaoguanjia.com",
    file: "https://file.banjixiaoguanjia.com",
  };

  return files.map((file) => {
    const cate = option.cate || typeToCate[file.type]; // 如果没有传入cate， 自动推算cate类型
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

export class UploadAliyunFile {
  // TODO: 这是是 `utils/uploadoss/uploadAliyun.js` uploadFile 第一个参数的类型
  //       目前的临时解决方案，之后封装了API之后修改
  cate: Cate;
  file: string;
  new_name: string;
  size: number;
  duration?: number;
}
