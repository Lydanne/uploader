/// <reference types="wechat-miniprogram" />
import { Cate, FileMeta } from "../core/UploadHandler";
export declare function transfromFileMeta(tempFiles: WechatMiniprogram.ChooseFile[], option: any): FileMeta[];
export declare function transfromUploadAliyunFile(files: FileMeta[], option: any): UploadAliyunFile[];
export declare class UploadAliyunFile {
    cate: Cate;
    file: string;
    new_name: string;
    size: number;
    duration?: number;
}
//# sourceMappingURL=tools.d.ts.map