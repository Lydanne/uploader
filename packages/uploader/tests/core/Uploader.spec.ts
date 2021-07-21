import {
  FileMeta,
  HookCb,
  Uploader,
  UploadHandler,
  UploadHandlerConstructor,
  UploadHook,
} from "../../src";

enum CustomUploadHook {
  TEST = "test",
}

class CustomUploadHandler extends UploadHandler<CustomUploadHook> {
  upload(): Promise<FileMeta[]> {
    return new Promise((resolve) => {
      this.hook().emit(CustomUploadHook.TEST, 1);
      resolve([
        { name: "aaa.xlsx", ext: "xlsx", size: 100, url: "oss/3423dfa.xlsx" },
      ]);
    });
  }
  about() {}
  process() {
    return 0;
  }
}

describe("Uploader.ts", () => {
  it("init Uploader load WeappUploaderHandler Module", async () => {
    const uploader = new Uploader(new CustomUploadHandler());
    expect(uploader).toBeDefined();
    const fn = jest.fn();
    uploader.onHook(UploadHook.CREATED, fn);
    const _uploader = await uploader.onceHook(UploadHook.CREATED);
    expect(_uploader).toBe(uploader);
    expect(fn).toBeCalled();
  });

  it("upload hook", async () => {
    const uploader = new Uploader(new CustomUploadHandler());
    const fn1 = jest.fn();
    uploader.onHook(UploadHook.UPLOADED, fn1);
    await uploader.upload();
    expect(fn1).toBeCalled();
    expect(fn1).toBeCalledWith(
      [{ name: "aaa.xlsx", ext: "xlsx", size: 100, url: "oss/3423dfa.xlsx" }],
      uploader
    );
  });

  it("destory Uploader", () => {
    const uploader = new Uploader(new CustomUploadHandler());
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    uploader.onceHook(UploadHook.DESTROYED, fn1);
    uploader.onHook(UploadHook.DESTROYED, fn2);
    uploader.destroy();
    expect(fn1).toBeCalled();
    expect(fn2).toBeCalled();
  });

  it("should throw error", () => {
    expect(() => new Uploader({} as any)).toThrowError(
      new Error("@sharedkit/Uploader: uploadHandler load error")
    );
  });
});
