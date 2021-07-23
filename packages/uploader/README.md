# Uploader

https://github.com/WumaCoder/uploader

## 特点

- 自定义传输处理器
- 事件钩子处理
- 简单
- 流的方式调用

## 安装

```shell
yarn add @sharedkit/uploader 
# npm i @sharedkit/uploader
```

## 简单使用

```js
import {
  Uploader,
  UploadHook,
  RemoteHook,
  LocalChooseUploadHandler,
  RemoteUploadHandler,
} from "@sharedkit/uploader";
// 或者 `const { Uploader, LocalChooseUploadHandler } = require('@sharedkit/uploader');`

async function runDemo() {
  const option = { // 选项与传入的处理器有关，因为这个直接给处理器传入的
    type: "file", // 传给wx.chooseMessageFile的type选项
    exts: ["xlsx"],// 传给wx.chooseMessageFile的extension选项
    prefix: `/score`, // 生成资源路径的前缀
    count: 1, // 传给wx.chooseMessageFile的count选项
    uploadFileHandler: (files) =>    // 上传处理程序的钩子，files是UploadAliyunFile类型，可以直接用于aliyunOss函数
        new Promise((resolve, reject) => {
          aliyunOss(files, resolve, reject);
     		}),
  };
  const uploader = new Uploader(LocalChooseUploadHandler, option); // 创建上传器，第一个参数是上传处理器的构造函数，option 是穿给他的参数
  const res = await uploader.upload().wait(); // upload是上传方法，wait是等传输完成，最后返回FileMeta[]

  console.log(res); // FileMeta[], 参考 FileMeta 类型
}

runDemo();
```

> 在班级小管家里可以使用更好的方式，使用`/utils/UploaderFactory.js`里的工厂函数，他会自动埋点发日志，自动传入类似于uploadFileHandler这样的方法，用户只需要关注使用即可，具体使用可以看`example/`下的例子。

## API

### 核心类

#### `Class` Uploader

> 创建上传处理器

```ts
export declare class Uploader<O> {
    /**
     * @param  {UploadHandlerConstruction<O>} UploadHandler // 上传处理器
     * @param  {O} option? 传给 UploadHandler 的选项
     */
    constructor(UploadHandler: UploadHandlerConstruction<O>, option?: O);
    /**
     * 同上
     * @param  {UploadHandlerConstruction<O>} UploadHandler
     * @param  {O} option?
     * @returns Uploader
     */
    loadUploadHandler(UploadHandler: UploadHandlerConstruction<O>, option?: O): Uploader<O>;
    /**
     * 开始上传
     * @returns Uploader
     */
    upload(): Uploader<O>;
    /**
     * 监听一个钩子
     * @param  {H} hook 钩子类型
     * @param  {HookCb<H>} cb 回调函数
     * @returns Uploader
     */
    on<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    /**
     * 移除一个钩子
     * @param  {H} hook
     * @param  {HookCb<H>} cb
     * @returns Uploader
     */
    off<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    /**
     * 监听一个钩子, 但只监听一次
     * @param  {H} hook 钩子类型
     * @param  {HookCb<H>} cb 回调函数
     * @returns Uploader
     */
    once<H extends UploadHook>(hook: H, cb: HookCb<H>): Uploader<O>;
    /**
     * 等待Uplaoder上传完成
     * */
    wait(): Promise<FileMeta[]>;
    /**
     * 获取或者修改选项
     * @param  {O} option? 传入的选项
     */
    option(option?: O): O;
    /**
     * 销毁
     * @returns void
     */
    destroy(): void;
}
```

#### `Class` *abstract* UploadHandler

> 这个类是用于自定义上传处理器的时候使用，如果您不写上传处理器是不需要了解的，如何写上传处理器，请查看LocalChooseUploadHandler源码

```ts
export declare abstract class UploadHandler<T, CUH = any, H = CUH | UploadHook> {
    constructor(option: T);
    option(option?: T): T;
    /**
     * 获取事件处理器
     * @returns EventHub
     */
    hook(): EventHub<H>;
    /**
     * 需要重写的方法，如果不重写会报错，核心的上传方法
     * @returns Promise
     */
    upload(): Promise<FileMeta[]>;
    /**
     * 需要重写的方法，如果不重写会报错，销毁方法
     * @returns void
     */
    destroy(): void;
}
```

#### `class` FileMeta

> 最后返回的文件类型，远程上传只会有url和ext，之后会支持

```ts
export interface FileMeta {
  name?: string; // 文件名
  size?: number; // 文件大小
  type?: string; // 文件类型
  ext?: string; // 文件扩展
  url?: string; // 文件在OSS的完整地址
  urlPath?: string; // 文件在OSS的上除去域名的部分
  path?: string; // 文件在本地到位置
  time?: number; // 文件在会话的时间
}
```



### 上传处理器

#### `class` LocalChooseUploadHandler

> 本地上传处理器

```ts
export class LocalChooseUploadHandlerOption { // 传入的选项
  exts: string[] = []; // 限制文件后缀，最后会传给微信API
  count: number = 1; // 限制文件数量，最后会传给微信API
  type: "all" | "video" | "image" | "file" = "all"; // 类型，给微信API的
  cate?: Cate; // 会传给 aliyunOss 这个方法
  size?: number = 1024 * 1024 * 3; // B, default 3MB 限制大小
  prefix?: string = ""; // 资源路径前缀
  uploadFileHandler: uploadFileHandler; // 上传文件的钩子函数, 在工厂函数里会自动写入
}

export type uploadFileHandler = (files: UploadAliyunFile[]) => Promise<string> | void;
// 上传处理器

type Cate =
  | "record" // 录音
  | "video" // 视频
  | "img" // 图片
  | "answer_img" // 答题图片
  | "file" // 文件，除图片视频录音
  | "album" // 网盘相册
  | "disk"; // 网盘

export class UploadAliyunFile {
  // TODO: 这是是 `utils/uploadoss/uploadAliyun.js` uploadFile 第一个参数的类型
  //       目前的临时解决方案，之后封装了API之后修改
  cate: Cate;
  file: string;
  new_name: string;
  size: number;
  duration?: number;
}
```

#### `class` RemoteUploadHandler

> 远程上传器

```ts
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
}


export type CreateCodeHandler = () => Promise<string>;
export type RemoveCodeHandler = (code) => Promise<void> | void;
export type ReadAssetUrlHandler = (
  string
) => Promise<string[] | undefined | false>;
```

##### 事件

```ts
export enum RemoteHook {
  CREATED_CODE = "createdCode", // 创建完传输码之后
}
```

### 事件

```ts
export enum UploadHook {
  CREATED = "created", // 创建完成后
  // BEFORE_UPLOAD = 'beforeUpload',
  UPLOADED = "uploaded", //上传完成后
  // ABOUT = "about",
  ERROR = "error", // 报错之后
  // PROCESS = "process",
  DESTROYED = "destroyed", // 销毁之后
  WAIT = "wait", // 上传完成之后，无论成功或失败，与uploaded回调参数有不同
}
```

### 工厂

> 注意：文件位置 /utils/UploaderFactory.js

#### 定义

```js
import {
  Uploader,
  UploadHook,
  RemoteHook,
  LocalChooseUploadHandler,
  RemoteUploadHandler
} from "@sharedkit/uploader";

const aliyunOss = require("./uploadoss/uploadAliyun.js");

let {
  getUniqueTransCode,
  getTransCodeContent,
  delTransCodeContent,
} = require("./request");

export class UploaderFactory {
  /**
   * 创建上传器
   * @param  { UploadHandlerConstruction } UploadHandler 上传处理器，LocalChooseUploadHandler 或者 RemoteUploadHandler
   * @param  { object } opts // 上传选项
   * @param  { object } logData // 上传携带的埋点数据 { cate } cate 从哪个功能模块上传，如 成绩，网盘
   */
  static create(UploadHandler, opts = {}, logData = {}) {
    const option = {
      uploadFileHandler: (files) =>
        new Promise((resolve, reject) => {
          // 上传处理程序的钩子
          aliyunOss(files, resolve, reject);
        }),
      createCodeHandler: () => getUniqueTransCode().then((res) => res.data),
      // 创建传输码的钩子
      removeCodeHandler: (code) =>
        delTransCodeContent({
          // 移除传输码的钩子
          trans_code: code,
        }),
      readAssetUrlHandler: async (code) => {
        // 使用传输码读取资源的钩子
        const res = await getTransCodeContent({
          trans_code: code,
        });

        if (res.code !== 0 || res.data === "1") {
          return;
        }

        return res.data.split(";");
      },
      ...opts,
    };

    const uploader = new Uploader(UploadHandler, option);

    uploader.on(UploadHook.CREATED, (data) => {
      console.log("created hook:", data);
      Log.ok({
        type: "created",
        message: "Uploader创建成功",
        ...logData,
      });
    });

    uploader.on(RemoteHook.CREATED_CODE, (code) => {
      console.log("createdCode hook:", code);
      Log.ok({
        type: "createdCode",
        message: "传输码创建成功",
        code,
        ...logData,
      });
    });

    uploader.on(UploadHook.UPLOADED, (files) => {
      console.log("uploaded hook:", files);
      Log.ok({
        type: "uploaded",
        message: "传输完成",
        files,
        ...logData,
      });
    });

    uploader.on(UploadHook.ERROR, (err) => {
      console.log("error hook:", err, err.file);
      Log.err({
        type: err.type,
        message: err.message,
        files: err.file.length ? err.file : [err.file],
        ...logData,
      });
    });

    return uploader;
  }
}
const app = getApp();

class Log {
  static ok(data) {
    Log.send({
      status: "ok",
      ...data,
    });
  }

  static err(data) {
    Log.send({
      status: "error",
      ...data,
    });
  }

  /**
   * data
   *  num
   *  files:FileMeta[]
   */
  static send(data) {
    const { files = [] } = data;

    const logData = delNullProperty({
      id: "导入上传",
      cate: data.cate, //是哪个模块上传的，成绩还是花名册还是网盘还是哪里
      num: files.length, //传了几个文件
      openid: app.globalData.currentUser.openid,
      name: JSON.stringify(files.map((file) => file.name)), //多个的话，怎么表示？
      url: JSON.stringify(files.map((file) => file.url)), // 文件地址
      op_type: JSON.stringify(files.map((file) => file.ext)), // 上传文件的类型
      file_size: files.reduce((p, n) => p + n.size, 0),
      status: data.status, // status  ok | error
      message: data.message, // 消息
      create_at: Date.now(), // 创建时间
      code: data.code, // 上传Code
      platform: "mini", // 上传的平台， mini 小程序， web网页
      type: data.type, // 阶段， created 实例创建，createCode Code生成，uploaded 上传完成
    });

    console.log(logData);

    app.addEvent(logData);
  }
}

//遍历删除对象中的空值属性
function delNullProperty(obj) {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const caseTrue =
        value === undefined ||
        value === null ||
        (typeof value === "number" && value === 0) ||
        (value instanceof Array && value.length === 0) ||
        value === "[]" ||
        value === "{}";

      if (caseTrue) {
        delete obj[key];
      }
    }
  }

  return obj;
}
```

#### 使用

> 详细查看 packages/uploader/example

```js
const option = {
  type: "file",
  exts: ["xlsx"],
  prefix: `/score/${cls.unique_code}`,
  count: 1,
};

const uploader = UploaderFactory.create(
  LocalChooseUploadHandler,
  option
);
const files = await uploader.upload().wait();
```

