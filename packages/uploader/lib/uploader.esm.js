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
    upload() {
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
    /**
     * @param  {UploadHandlerConstruction<O>} UploadHandler // 传输器
     * @param  {O} option? 传给 UploadHandler 的选项
     */
    constructor(UploadHandler, option) {
        this.loadUploadHandler(UploadHandler, option);
    }
    /**
     * 同上
     * @param  {UploadHandlerConstruction<O>} UploadHandler
     * @param  {O} option?
     * @returns Uploader
     */
    loadUploadHandler(UploadHandler, option) {
        let hook = null;
        if (this._uploadHandler) {
            this._uploadHandler.about();
            hook = this._uploadHandler.hook();
        }
        this._option = optionHander(option, this._option);
        this._uploadHandler = new UploadHandler(this._option);
        this._uploadHandler.hook(hook);
        if (!(this._uploadHandler instanceof UploadHandler)) {
            throw new Error("@sharedkit/Uploader: uploadHandler load error");
        }
        this._uploadHandler.hook().asyncEmit(UploadHook.CREATED, this);
        return this;
    }
    /**
     * 开始上传
     * @returns Uploader
     */
    upload() {
        this._uploadHandler
            .upload()
            .then((res) => {
            this._uploadHandler.hook().emit(UploadHook.UPLOADED, res);
            this._uploadHandler.hook().emit(UploadHook.WAIT, null, res);
        })
            .catch((err) => {
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
        this._uploadHandler.about();
        this._uploadHandler.hook().emit(UploadHook.ABOUT);
        return this;
    }
    uploadHandler(handler) {
        if (handler) {
            this.loadUploadHandler(handler);
        }
        return this._uploadHandler;
    }
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
        const [_, ext = ""] = url.match(/.(\w+)$/);
        return ext;
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

class LocalChooseUploadHandlerOption {
    exts = []; // 限制文件后缀，最后会传给微信API
    count = 1; // 限制文件数量，最后会传给微信API
    type = "all"; // 类型，给微信API的
    cate; // 会传给 aliyunOss 这个方法
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
        const tempFiles = await selectFile.call(this);
        const files = transfromFileMeta.call(this, tempFiles);
        const uploadAliyunFiles = await transfromUploadAliyunFile.call(this, files);
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
                count: this._option.count,
                type: this._option.type,
                extension: this._option.exts,
            });
            return tempFiles;
        }
        function transfromFileMeta(tempFiles = []) {
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
                let ext = UrlParser.ext(tempFile.name);
                if (this._option.exts?.length &&
                    !this._option.exts.includes(ext.toLowerCase())) {
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
        function transfromUploadAliyunFile(files) {
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
                album: "https://album.welife001.com",
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
    about() { }
    destroy() { }
}
class UploadAliyunFile {
    // TODO: 这是是 `utils/uploadoss/uploadAliyun.js` uploadFile 第一个参数的类型
    //       目前的临时解决方案，之后封装了API之后修改
    cate;
    file;
    new_name;
    size;
    duration;
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
    // type: "all" | "video" | "image" | "file" = "all";
    // cate?: Cate;
    // size?: number = 1024 * 1024 * 3; // B, default 3MB
    // prefix?: string = "";
    maxReadAssetUrlTimes = 3000; // 限制轮询次数
    sleepInterval = 1000; // ms default 1s 轮询间隔
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
    _aboutPool = false;
    constructor(option) {
        super(optionHander(option, new RemoteUploadHandlerOption()));
    }
    async upload() {
        await this.option().removeCodeHandler(this._code);
        const code = await this.option().createCodeHandler();
        this._code = code;
        this.hook().asyncEmit(RemoteHook.CREATED_CODE, code);
        const urls = await pool.call(this);
        let files = transfromToFileMeta.call(this, urls);
        await verifyFile.call(this, files);
        return files;
        async function pool() {
            for (let i = 0; i < this._option.maxReadAssetUrlTimes; i++) {
                if (this._aboutPool) {
                    this._aboutPool = false;
                    throw new AboutException();
                }
                const urls = await this._option.readAssetUrlHandler(code);
                if (urls === false) {
                    return [];
                }
                if (urls) {
                    return urls;
                }
                await sleep(this._option.sleepInterval);
            }
            return [];
        }
        function transfromToFileMeta(urls) {
            return urls.map((url) => {
                return {
                    url,
                    ext: UrlParser.ext(url),
                };
            });
        }
        async function verifyFile(files) {
            if (files.length > this._option.count) {
                throw new VerifyFileException("count", files);
            }
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!this._option.exts.includes(file.ext)) {
                    throw new VerifyFileException("ext", file);
                }
                if (!(await this.option().verifyContentHandler(file))) {
                    throw new VerifyFileException("content", file);
                }
            }
        }
    }
    destroy() {
        this.about();
        this.option().removeCodeHandler(this._code);
    }
    about() {
        this._aboutPool = true;
    }
}

export { AboutException, CantUseApiException, EventHub, LocalChooseUploadHandler, LocalChooseUploadHandlerOption, RemoteHook, RemoteUploadHandler, RemoteUploadHandlerOption, UploadAliyunFile, UploadFileException, UploadHandler, UploadHook, Uploader, VerifyFileException };
//# sourceMappingURL=uploader.esm.js.map
