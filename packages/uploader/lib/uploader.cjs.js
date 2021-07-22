'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.UploadHook = void 0;
(function (UploadHook) {
    UploadHook["CREATED"] = "created";
    // BEFORE_UPLOAD = 'beforeUpload',
    UploadHook["UPLOADED"] = "uploaded";
    UploadHook["ABOUT"] = "about";
    UploadHook["ERROR"] = "error";
    UploadHook["PROCESS"] = "process";
    UploadHook["DESTROYED"] = "destroyed";
})(exports.UploadHook || (exports.UploadHook = {}));
class UploadHandler {
    _hook = new EventHub();
    name() {
        throw new Error("Method not implemented.");
    }
    upload() {
        throw new Error("Method not implemented.");
    }
    hook() {
        return this._hook;
    }
}

class Uploader {
    _uploadHandler;
    constructor(uploaderHandler) {
        if (!(uploaderHandler instanceof UploadHandler)) {
            throw new Error("@sharedkit/Uploader: uploadHandler load error");
        }
        this._uploadHandler = uploaderHandler;
        this._uploadHandler.hook().asyncEmit(exports.UploadHook.CREATED, this);
    }
    async upload() {
        try {
            const res = await this._uploadHandler.upload();
            this._uploadHandler.hook().emit(exports.UploadHook.UPLOADED, res, this);
            return res;
        }
        catch (err) {
            this._uploadHandler.hook().emit(exports.UploadHook.ERROR, err, this);
            return [];
        }
    }
    onHook(hook, cb) {
        this._uploadHandler.hook().on(hook, cb);
        return this;
    }
    offHook(hook, cb) {
        this._uploadHandler.hook().off(hook, cb);
        return this;
    }
    onceHook(hook, cb) {
        if (cb) {
            this._uploadHandler.hook().once(hook, cb);
            return;
        }
        return new Promise((resolve) => {
            this._uploadHandler.hook().once(hook, resolve);
        });
    }
    destroy() {
        this._uploadHandler.hook().emit(exports.UploadHook.DESTROYED);
        this._uploadHandler
            .hook()
            .events()
            .forEach((_, k) => this._uploadHandler.hook().remove(k));
        this._uploadHandler = null;
    }
}

function optionHander(option, defaultOption) {
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
    exts = [];
    count = 1;
    type = "all";
    cate;
    size = 1024 * 1024 * 3; // B, default 3MB
    prefix = "";
}
class LocalChooseUploadHandler extends UploadHandler {
    _option;
    _requestHandler;
    constructor(option, requestHandler) {
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
        await this._requestHandler.call(this, uploadAliyunFiles);
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
                let [_, ext] = tempFile.name.match(/.(\w+)$/);
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
                    new_name: file.urlPath,
                    size: file.size,
                };
            });
        }
    }
    option() {
        return this._option;
    }
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

exports.CantUseApiException = CantUseApiException;
exports.EventHub = EventHub;
exports.LocalChooseUploadHandler = LocalChooseUploadHandler;
exports.LocalChooseUploadHandlerOption = LocalChooseUploadHandlerOption;
exports.UploadAliyunFile = UploadAliyunFile;
exports.UploadFileException = UploadFileException;
exports.UploadHandler = UploadHandler;
exports.Uploader = Uploader;
exports.VerifyFileException = VerifyFileException;
//# sourceMappingURL=uploader.cjs.js.map
