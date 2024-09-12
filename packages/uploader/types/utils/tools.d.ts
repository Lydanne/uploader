/// <reference types="wechat-miniprogram" />
import { Cate, FileMeta } from "../core/UploadHandler";
export declare function transfromFileMeta(tempFiles: WechatMiniprogram.ChooseFile[], option: any): FileMeta[];
export declare function spurl(key: string, cate: string): string;
export declare function spurl2(key: string, joinCb?: (key: string) => string): string;
export declare function transfromUploadAliyunFile(files: FileMeta[], option: any): UploadAliyunFile[];
export declare class UploadAliyunFile {
    cate: Cate;
    file: string;
    new_name: string;
    size: number;
    duration?: number;
    uploaded?: boolean;
}
//# sourceMappingURL=tools.d.ts.map