'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const numberSeeds = "0123456789";
function code(len = 4, seeds = numberSeeds) {
    let t = '';
    for (let i = 0; i < len; i++) {
        t += seeds[random(0, seeds.length)];
    }
    return t;
}
function random(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
}

class UploaderRemote {
    createPipe() {
        return code();
    }
    removePipe() {
    }
    readPipeContent() {
    }
    writePipeContent() {
    }
}

exports.UploaderRemote = UploaderRemote;
//# sourceMappingURL=uploader-remote.cjs.js.map
