function optionHander(option, defaultOption = {}) {
    if (!option || typeof option !== "object") {
        return option || defaultOption;
    }
    const keys = Object.keys(option);
    return keys.reduce((prev, key) => {
        const val = option[key];
        if (val && typeof val === "object") {
            prev[key] = optionHander(val, defaultOption[key] || {});
        }
        else {
            prev[key] = val;
        }
        return prev;
    }, defaultOption);
}
function sleep(interval) {
    return new Promise((resolve) => setTimeout(resolve, interval));
}

class EventHub {
    _events = new Map();
    on(key, cb) {
        if (!this._events.has(key)) {
            this._events.set(key, new Set);
        }
        this._events.get(key).add(cb);
        return this;
    }
    off(key, cb) {
        if (!this._events.has(key)) {
            return this;
        }
        this._events.get(key).delete(cb);
        return this;
    }
    remove(key) {
        if (!this._events.has(key)) {
            return this;
        }
        this._events.get(key).forEach(cb => this.off(key, cb));
        this._events.delete(key);
    }
    once(key, cb) {
        if (!this._events.has(key)) {
            this._events.set(key, new Set);
        }
        const that = this;
        this._events.get(key).add(function t(...args) {
            cb(...args);
            that.off(key, t);
        });
        return this;
    }
    emit(key, ...args) {
        if (!this._events.has(key)) {
            return this;
        }
        this._events.get(key).forEach(cb => cb(...args));
    }
    events() {
        return this._events;
    }
    async asyncEmit(key, ...args) {
        await Promise.resolve().then(() => this.emit(key, ...args));
    }
}
// TODO: 类型提示需要优化

var UploadHook;
(function (UploadHook) {
    UploadHook["CREATED"] = "created";
    // BEFORE_UPLOAD = 'beforeUpload',
    UploadHook["UPLOADED"] = "uploaded";
    UploadHook["ABOUT"] = "about";
    UploadHook["ERROR"] = "error";
    // PROCESS = "process",
    UploadHook["DESTROYED"] = "destroyed";
    UploadHook["WAIT"] = "wait";
})(UploadHook || (UploadHook = {}));
class UploadHandler {
    _hook = new EventHub();
    _option;
    constructor(option) {
        this.option(option);
    }
    option(option) {
        if (option) {
            this._option = option;
        }
        return this._option;
    }
    /**
     * 获取事件处理器
     * @returns EventHub
     */
    hook(hook) {
        if (hook) {
            this._hook = hook;
        }
        return this._hook;
    }
    /**
     * 需要重写的方法，如果不重写会报错，核心的上传方法
     * @returns Promise
     */
    upload(tempFiles) {
        throw new Error("Method not implemented.");
    }
    /**
     * 需要重写的方法，如果不重写会报错，销毁方法
     * @returns void
     */
    destroy() {
        throw new Error("Method not implemented.");
    }
    about() {
        throw new Error("Method not implemented.");
    }
}
class VerifyFileException extends Error {
    name = "VerifyFileException";
    type;
    file;
    constructor(type, file) {
        super(`File ${type} no pass verify.`);
        this.type = type;
        this.file = file;
    }
}
class AboutException extends Error {
    type;
    constructor() {
        super(`About Run`);
        this.type = "about";
    }
}

class Uploader {
    _uploadHandler;
    _option;
    _isRun;
    /**
     * @param  {UploadHandlerConstruction<O>} UploadHandler // 传输器
     * @param  {O} option? 传给 UploadHandler 的选项
     */
    constructor(UploadHandler, option) {
        this.loadUploadHandler(UploadHandler, option);
    }
    /**
     * 同上
     * @param  {UploadHandlerConstruction<O>} LoadUploadHandler
     * @param  {O} option?
     * @returns Uploader
     */
    loadUploadHandler(LoadUploadHandler, option) {
        if (this._uploadHandler &&
            this._uploadHandler instanceof LoadUploadHandler) {
            return this;
        }
        this._isRun = false;
        let hook = null;
        if (this._uploadHandler) {
            this._uploadHandler.about();
            hook = this._uploadHandler.hook();
        }
        this._option = optionHander(option, this._option);
        this._uploadHandler = new LoadUploadHandler(this._option);
        this._uploadHandler.hook(hook);
        if (!(this._uploadHandler instanceof LoadUploadHandler)) {
            throw new Error("@sharedkit/Uploader: uploadHandler load error");
        }
        this._uploadHandler.hook().asyncEmit(UploadHook.CREATED, this);
        return this;
    }
    /**
     * 开始上传
     * @returns Uploader
     */
    upload(tempFiles) {
        if (this._isRun) {
            return this;
        }
        this._isRun = true;
        this._uploadHandler
            .upload(tempFiles)
            .then((res) => {
            this._isRun = false;
            this._uploadHandler.hook().emit(UploadHook.UPLOADED, res);
            this._uploadHandler.hook().emit(UploadHook.WAIT, null, res);
        })
            .catch((err) => {
            this._isRun = false;
            this._uploadHandler.hook().emit(UploadHook.ERROR, err);
            this._uploadHandler.hook().emit(UploadHook.WAIT, err, null);
        });
        return this;
    }
    /**
     * 监听一个钩子
     * @param  {H} hook 钩子类型
     * @param  {HookCb<H>} cb 回调函数
     * @returns Uploader
     */
    on(hook, cb) {
        this._uploadHandler.hook().on(hook, cb);
        return this;
    }
    /**
     * 移除一个钩子
     * @param  {H} hook
     * @param  {HookCb<H>} cb
     * @returns Uploader
     */
    off(hook, cb) {
        this._uploadHandler.hook().off(hook, cb);
        return this;
    }
    /**
     * 监听一个钩子, 但只监听一次
     * @param  {H} hook 钩子类型
     * @param  {HookCb<H>} cb 回调函数
     * @returns Uploader
     */
    once(hook, cb) {
        this._uploadHandler.hook().once(hook, cb);
        return this;
    }
    /**
     * 等待Uplaoder上传完成
     * */
    wait() {
        return new Promise((resolve, reject) => {
            this.once(UploadHook.WAIT, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
    /**
     * 获取或者修改选项
     * @param  {O} option? 传入的选项
     */
    option(option) {
        return this._uploadHandler.option(option);
    }
    /**
     * 销毁
     * @returns void
     */
    destroy() {
        this._uploadHandler.destroy();
        this._uploadHandler.hook().emit(UploadHook.DESTROYED);
        this._uploadHandler
            .hook()
            .events()
            .forEach((_, k) => this._uploadHandler.hook().remove(k));
    }
    about() {
        if (this._isRun) {
            this._uploadHandler.about();
            this._uploadHandler.hook().emit(UploadHook.ABOUT);
        }
        return this;
    }
    uploadHandler(handler) {
        if (handler) {
            this.loadUploadHandler(handler);
        }
        return this._uploadHandler;
    }
}

var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
function uuid(len, radix = CHARS.length) {
    var chars = CHARS, uuid = [];
    if (len) {
        for (var i = 0; i < len; i++)
            uuid[i] = chars[0 | (Math.random() * radix)];
    }
    else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
        uuid[14] = "4";
        for (var i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | (Math.random() * 16);
                uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r & 0xf];
            }
        }
    }
    return uuid.join("");
}

class UrlParser {
    static parse(url) {
        const ext = UrlParser.ext(url);
        return {
            url,
            ext,
        };
    }
    static ext(url) {
        const [_, ext = ""] = url.match(/.(\w+)$/) || [];
        return ext;
    }
}

function transfromFileMeta(tempFiles = [], option) {
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
function spurl(key, cate) {
    if (!key.startsWith("/")) {
        key = "/" + key;
    }
    return ossBucketMap[cate] + key;
}
function transfromUploadAliyunFile(files, option) {
    const typeToCate = {
        all: "disk",
        video: "video",
        image: "img",
        file: "file",
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

class LocalChooseUploadHandlerOption {
    exts = []; // 限制文件后缀，最后会传给微信API
    count = 1; // 限制文件数量，最后会传给微信API
    type = "all"; // 类型，给微信API的
    cate; // 会传给 aliyunOss 这个方法, 如果不传会通过type推算
    size = 1024 * 1024 * 3; // B, default 3MB 限制大小
    prefix = ""; // 资源路径前缀
    uploadFileHandler; // 上传文件的钩子函数
    verifyContentHandler = async () => true;
}
// 上传处理程序的约束
class LocalChooseUploadHandler extends UploadHandler {
    constructor(option) {
        super(optionHander(option, new LocalChooseUploadHandlerOption()));
    }
    async upload() {
        const self = this;
        const tempFiles = await selectFile();
        const files = transfromFileMeta(tempFiles, this.option());
        const uploadAliyunFiles = await transfromUploadAliyunFile(files, this.option());
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
    about() { }
    destroy() { }
}
class CantUseApiException extends Error {
    name = "CantUseApiException";
    type;
    constructor(api) {
        super(`Cant use ${api} because doesn't support it.`);
        this.type = api;
    }
}
class UploadFileException extends Error {
    name = "ResponseStatusCodeException";
    type;
    result;
    constructor(res) {
        super(`http status ${res.statuCode} not 2xx.`);
        this.type = res.statuCode;
        this.result = res;
    }
}

class RemoteUploadHandlerOption {
    exts = []; // 限制文件后缀
    count = 1; // 限制文件数量
    type = "all";
    cate;
    size = 1024 * 1024 * 3; // B, default 3MB
    prefix = "";
    maxReadAssetUrlTimes = 3000; // 限制轮询次数    - 弃用选项，请使用maxAge
    sleepInterval = 1000; // ms default 1s 轮询间隔 - 弃用选项，请使用maxAge
    maxAge = 5 * 60; // s default 5分钟 + Code过期时间
    createCodeHandler; // 创建传输码的钩子
    removeCodeHandler; // 移除传输码的钩子
    readAssetUrlHandler; // 读取传输码的钩子
    verifyContentHandler = async () => true; // 验证文件内容
}
var RemoteHook;
(function (RemoteHook) {
    RemoteHook["CREATED_CODE"] = "createdCode";
})(RemoteHook || (RemoteHook = {}));
class RemoteUploadHandler extends UploadHandler {
    _code;
    _codeExpriedAt; // 过期时间
    _aboutPool = false;
    constructor(option) {
        super(optionHander(option, new RemoteUploadHandlerOption()));
    }
    async upload() {
        const self = this;
        const files = await pool();
        await verifyFile(files);
        if (this._code)
            await this.option().removeCodeHandler(this._code, this);
        this._code = "";
        return files;
        async function pool() {
            while (true) {
                const code = await self.option().createCodeHandler(self);
                self._codeExpriedAt = Date.now() + self.option().maxAge * 1000;
                self.hook().emit(RemoteHook.CREATED_CODE, code);
                self._code = code;
                while (self._codeExpriedAt >= Date.now()) {
                    if (self._aboutPool) {
                        self._aboutPool = false;
                        if (self._code)
                            await self.option().removeCodeHandler(self._code, self);
                        self._code = "";
                        throw new AboutException();
                    }
                    const urls = await self.option().readAssetUrlHandler(code, self);
                    if (urls === false) {
                        return [];
                    }
                    if (urls) {
                        return urls;
                    }
                    await sleep(1000);
                }
            }
            return [];
        }
        async function verifyFile(files) {
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
    destroy() {
        this.about();
    }
    async about() {
        this._aboutPool = true;
        if (this._code)
            await this.option().removeCodeHandler(this._code, this);
        this._code = "";
    }
}

class LocalUploadHandlerOption {
    exts = []; // 限制文件后缀，最后会传给微信API
    count = 1; // 限制文件数量，最后会传给微信API
    type = "all"; // 类型，给微信API的
    cate; // 会传给 aliyunOss 这个方法, 如果不传会通过type推算
    size = 1024 * 1024 * 3; // B, default 3MB 限制大小
    prefix = ""; // 资源路径前缀
    uploadFileHandler; // 上传文件的钩子函数
    verifyContentHandler = async () => true;
}
class LocalUploadHandler extends UploadHandler {
    constructor(option) {
        super(optionHander(option, new LocalUploadHandlerOption()));
    }
    async upload(tempFiles) {
        const files = transfromFileMeta(tempFiles, this.option());
        const uploadAliyunFiles = await transfromUploadAliyunFile(files, this.option());
        await this.option().uploadFileHandler(uploadAliyunFiles);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!(await this.option().verifyContentHandler(file))) {
                throw new VerifyFileException("content", file);
            }
        }
        return files;
    }
    about() { }
    destroy() { }
}

function urlParser(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => {
        acc.push(`${key}=${obj[key]}`);
        return acc;
    }, [])
        .join("&");
}

class QQDocUploadHandlerOption {
    exts = []; // 限制文件后缀
    count = 1; // 限制文件数量
    type = "file";
    prefix = "";
    transfer; // 是否转存
    oauthHandler; // 获取token的钩子函数
    selectFileView; // 有传这个字段表示要刷新token
    verifyContentHandler = async () => true; // 验证文件内容
    uploadFileHandler; // 上传文件的钩子函数
}
var QQDocHook;
(function (QQDocHook) {
    QQDocHook["GET_TOKEN_OK"] = "getTokenOk";
    QQDocHook["BEFORE_FILTER"] = "beforeFilter";
    QQDocHook["AFTER_FILTER"] = "afterFilter";
    QQDocHook["TRANSFER_OK"] = "transferOk";
    QQDocHook["TRANSFER_BEGIN"] = "transferBegin";
    QQDocHook["TRANSFER_END"] = "transferEnd";
    QQDocHook["TRANSFER_ING"] = "transferIng";
})(QQDocHook || (QQDocHook = {}));
/**
 * 腾讯文档上传处理器
 */
class QQDocUploadHandler extends UploadHandler {
    _token;
    _aboutPool = false;
    constructor(option) {
        super(optionHander(option, new QQDocUploadHandlerOption()));
    }
    async upload() {
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
                    };
                });
            });
        });
        // await verifyFile(selectFiles);
        if (this.option().transfer)
            await this.transfer(selectFiles);
        return selectFiles;
    }
    async transfer(files) {
        const prefix = this.option().prefix || "";
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            file.uploaded = false;
            // const fileID = await this.request<{ data: { fileID: string } }>(
            //   `/openapi/drive/v2/util/converter?type=2&value=${file._raw_.ID}`
            // );
            const task = await this.request(`/openapi/drive/v2/files/${file._raw_.ID}/async-export`, {}, "POST");
            this.hook().emit(QQDocHook.TRANSFER_BEGIN, task);
            while (true) {
                const res = await this.request(`/openapi/drive/v2/files/${file._raw_.ID}/export-progress?operationID=${task.data.data.operationID}`);
                this.hook().emit(QQDocHook.TRANSFER_ING, res);
                if (res.data.data.url) {
                    const downRes = await new Promise((resolve, reject) => wx.downloadFile({
                        url: res.data.data.url,
                        success: resolve,
                        fail: reject,
                    }));
                    const tempFilePath = downRes.tempFilePath;
                    const xgjFile = {
                        cate: "file",
                        file: tempFilePath,
                        new_name: prefix + file._raw_.ID + "/" + file.name,
                        size: 0,
                    };
                    await this.option().uploadFileHandler([xgjFile]);
                    file.url = spurl(xgjFile.new_name, "file");
                    file.urlPath = "/" + xgjFile.new_name;
                    file.uploaded = true;
                    this.hook().emit(QQDocHook.TRANSFER_END, downRes);
                    break;
                }
                await sleep(1000);
            }
        }
    }
    async driveFilter(opt) {
        // listType	string	否	见列表类型，默认为 folder
        // sortType	string	否	见排序类型，默认为 browse
        // asc	integer	否	是否正序排列，1：正序，0：倒序，默认为 0
        // folderID	string	否	文件夹唯一标识，根目录 folderID 为 /。默认为 /
        // start	integer	否	开始值，第一次填 0，后续填 next 的值
        // limit	integer	否	拉取数，上限为 20
        // isOwner	integer	否	根据请求者是否为文件拥有者进行过滤，1：返回所有文件，2：返回请求者拥有的文件，默认为返回所有文件
        // fileType	string	否	指定要拉取的文件品类，可传多个，用减号 - 分割，默认为拉取所有品类。见文件类型
        const res = await this.request(`/openapi/drive/v2/filter?${urlParser(opt)}`);
        return res.data.data;
    }
    request(path, data, method = "GET") {
        return new Promise((resolve, reject) => {
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
                success: (res) => resolve({ status: res.statusCode, data: res.data }),
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

export { AboutException, CantUseApiException, EventHub, LocalChooseUploadHandler, LocalChooseUploadHandlerOption, LocalUploadHandler, LocalUploadHandlerOption, QQDocHook, QQDocUploadHandler, QQDocUploadHandlerOption, RemoteHook, RemoteUploadHandler, RemoteUploadHandlerOption, UploadFileException, UploadHandler, UploadHook, Uploader, VerifyFileException };
//# sourceMappingURL=uploader.esm.js.map
