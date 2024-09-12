import { UrlParser } from "./../utils/UrlParser";
import { optionHander, sleep } from "../utils/Function";
import {
  AboutException,
  Cate,
  FileMeta,
  UploadHandler,
  VerifyContentHandler,
  VerifyFileException,
} from "../core/UploadHandler";
import { urlParser } from "src/utils/urlParams";
import {
  UploadAliyunFile,
  spurl,
  spurl2,
  transfromUploadAliyunFile,
} from "src/utils/tools";
import {
  uploadFileHandler,
  type resolveHandler,
} from "./LocalChooseUploadHandler";

export type OAuthHandlerRes = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string; // 1 年有效期
  user_id: string;
  scope: string;
  client_id: string;
};

export type OAuthHandler = (
  oAuthHandlerRes?: OAuthHandlerRes // 有传这个字段表示要刷新token
) => Promise<OAuthHandlerRes>;

export class QQDocUploadHandlerOption {
  exts: string[] = []; // 限制文件后缀
  count: number = 1; // 限制文件数量
  type: "file" = "file";
  prefix?: string = "";
  transfer?: boolean; // 是否转存
  oauthHandler: OAuthHandler; // 获取token的钩子函数
  selectFileView?: (
    fetch: (type: "next") => Promise<FileMeta[]>
  ) => Promise<FileMeta[]>; // 有传这个字段表示要刷新token
  verifyContentHandler: VerifyContentHandler = async () => true; // 验证文件内容
  uploadFileHandler: uploadFileHandler; // 上传文件的钩子函数
  resolveHandler: resolveHandler;
}

export enum QQDocHook {
  GET_TOKEN_OK = "getTokenOk",
  BEFORE_FILTER = "beforeFilter",
  AFTER_FILTER = "afterFilter",
  TRANSFER_OK = "transferOk",
  TRANSFER_BEGIN = "transferBegin",
  TRANSFER_END = "transferEnd",
  TRANSFER_ING = "transferIng",
}

/**
 * 腾讯文档上传处理器
 */
export class QQDocUploadHandler extends UploadHandler<
  QQDocUploadHandlerOption,
  QQDocHook
> {
  private _token: OAuthHandlerRes;
  private _aboutPool = false;
  constructor(option: QQDocUploadHandlerOption) {
    super(optionHander(option, new QQDocUploadHandlerOption()));
  }

  async upload(): Promise<FileMeta[]> {
    const self = this;

    const token = await this.option().oauthHandler(this._token);
    this._token = token;
    self.hook().emit(QQDocHook.GET_TOKEN_OK, token);

    let next = 0;
    let isMore = true;
    const selectFiles = await this.option().selectFileView(() => {
      if (isMore === false) {
        return Promise.resolve([]);
      }
      const opt = {
        fileType: "doc-slide-sheet-pdf",
        limit: 20,
        start: next,
      };
      self.hook().emit(QQDocHook.BEFORE_FILTER, opt);

      return self.driveFilter(opt).then((res) => {
        next = res.next;
        if (next === 0) {
          isMore = false;
        }
        self.hook().emit(QQDocHook.AFTER_FILTER, res);
        return res.list.map((item) => {
          const ext = {
            doc: "doc",
            sheet: "xls",
            slide: "ppt",
            pdf: "pdf",
            mind: "mind",
            folder: "folder",
            shortcut: "shortcut",
          }[item.type];
          return {
            id: item.ID,
            name: item.title + "." + ext,
            ext: ext,
            size: 0,
            url: item.url,
            urlPath: item.url,
            path: item.url,
            type: item.type === "folder" ? "folder" : "file",
            creatorName: item.creatorName,
            time: item.createTime * 1000,
            uploaded: true,
            _raw_: item,
          } as FileMeta;
        });
      });
    });

    // await verifyFile(selectFiles);

    if (this.option().transfer) await this.transfer(selectFiles);

    return selectFiles;

    async function verifyFile(files: FileMeta[]) {
      if (files.length > self.option().count) {
        throw new VerifyFileException("count", files);
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!self.option().exts.includes(file.ext.toLowerCase())) {
          throw new VerifyFileException("ext", file);
        }
        if (!(await self.option().verifyContentHandler(file))) {
          throw new VerifyFileException("content", file);
        }
      }
    }
  }

  private async transfer(files: FileMeta[]) {
    const self = this;
    const prefix = this.option().prefix || "";
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      file.uploaded = false;
      // const fileID = await this.request<{ data: { fileID: string } }>(
      //   `/openapi/drive/v2/util/converter?type=2&value=${file._raw_.ID}`
      // );
      const task = await this.request<{ data: { operationID: string } }>(
        `/openapi/drive/v2/files/${file._raw_.ID}/async-export`,
        {},
        "POST"
      );
      this.hook().emit(QQDocHook.TRANSFER_BEGIN, task);
      while (true) {
        const res = await this.request<{
          data: { status: string; url: string };
        }>(
          `/openapi/drive/v2/files/${file._raw_.ID}/export-progress?operationID=${task.data.data.operationID}`
        );
        this.hook().emit(QQDocHook.TRANSFER_ING, res);

        if (res.data.data.url) {
          const downRes: any = await new Promise((resolve, reject) =>
            wx.downloadFile({
              url: res.data.data.url,
              success: resolve,
              fail: reject,
            })
          );
          const tempFilePath = downRes.tempFilePath;
          const xgjFile: UploadAliyunFile = {
            cate: "file",
            file: tempFilePath,
            new_name: prefix + file._raw_.ID + "/" + file.name,
            size: 0,
          };
          await this.option().uploadFileHandler([xgjFile]);

          file.urlPath = spurl2(xgjFile.new_name);
          file.url = spurl2(xgjFile.new_name, (key) =>
            self.option().resolveHandler(xgjFile.cate, key)
          );
          file.uploaded = true;
          this.hook().emit(QQDocHook.TRANSFER_END, downRes);

          break;
        }

        await sleep(1000);
      }
    }
  }

  private async driveFilter(opt: {
    listType?: string;
    sortType?: string;
    asc?: number;
    folderID?: string;
    start?: number;
    limit?: number;
    isOwner?: number;
    fileType?: string;
  }) {
    // listType	string	否	见列表类型，默认为 folder
    // sortType	string	否	见排序类型，默认为 browse
    // asc	integer	否	是否正序排列，1：正序，0：倒序，默认为 0
    // folderID	string	否	文件夹唯一标识，根目录 folderID 为 /。默认为 /
    // start	integer	否	开始值，第一次填 0，后续填 next 的值
    // limit	integer	否	拉取数，上限为 20
    // isOwner	integer	否	根据请求者是否为文件拥有者进行过滤，1：返回所有文件，2：返回请求者拥有的文件，默认为返回所有文件
    // fileType	string	否	指定要拉取的文件品类，可传多个，用减号 - 分割，默认为拉取所有品类。见文件类型
    const res = await this.request<{
      data: { next: number; list: FileItem[] };
      ret: number;
    }>(`/openapi/drive/v2/filter?${urlParser(opt)}`);
    return res.data.data;
  }

  private request<R>(path: string, data?: any, method: any = "GET") {
    return new Promise<{ status: number; data: R }>((resolve, reject) => {
      const baseUrl = "https://docs.qq.com";
      wx.request({
        url: baseUrl + path,
        method,
        data,
        header: {
          "Access-Token": this._token.access_token,
          "Client-Id": this._token.client_id,
          "Open-Id": this._token.user_id,
        },
        success: (res) =>
          resolve({ status: res.statusCode, data: res.data as R }),
        fail: reject,
      });
    });
  }

  destroy() {
    this.about();
  }

  async about() {
    this._aboutPool = true;
  }
}

// ID	string	文档或文件夹唯一标识，详见fileID，文档的源文件 ID。快捷方式 ID 见 shortcutID
// title	string	文档标题
// type	string	见文件类型
// url	string	文档 / 文件夹链接
// status	string	文档状态
// NORMAL: 状态正常
// TRASH：在回收站
// fileSource	string	文件来源，详见文件来源说明
// isCreator	boolean	是否是文件创建者
// createTime	integer	文档创建时间
// creatorName	string	文档创建者昵称
// isOwner	boolean	是否是文件拥有者
// ownerName	string	文档所有者昵称
// lastModifyTime	integer	文档最后修改时间
// lastBrowseTime	integer	在当前列表中的最后浏览时间
// starred	boolean	是否为星标文件，文件夹不会返回
// pinned	boolean	在当前列表中是否被置顶，文件夹不会返回
// shortcutID	string	快捷方式 ID。如果不为空，则说明为快捷方式文档。
// isCollaborated	boolean	是否为协作文件，文件夹不返回
type FileItem = {
  ID: string;
  title: string;
  type: string;
  url: string;
  status: string;
  fileSource: string;
  isCreator: boolean;
  createTime: number;
  creatorName: string;
  isOwner: boolean;
  ownerName: string;
  lastModifyTime: number;
  lastBrowseTime: number;
  starred: boolean;
  pinned: boolean;
  shortcutID: string;
  isCollaborated: boolean;
};

function etFilePath(url: string) {
  const idx = url.indexOf(".com/");
  return url.substring(idx + 4);
}
