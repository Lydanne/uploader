import { LocalChooseUploadHandler } from "./../../src/upload-handler/LocalChooseUploadHandler";
import { Uploader } from "../../src/core/Uploader";

function mockWx() {
  (globalThis as any).wx = {
    canIUse: jest.fn(() => true),
    chooseMessageFile: jest.fn(() => ({
      tempFiles: [
        {
          path: "/user/1.xlsx",
          size: 100,
          name: "1.xlsx",
          type: "file",
          time: "",
        },
      ],
    })),
    uploadFile: jest.fn(({ success }) => {
      success({ statusCode: "200" });
      return { about: jest.fn() };
    }),
  };
}

describe("LocalChooseUploadHandler.ts", () => {
  it("init WeappUploadHandler", () => {
    mockWx();
    const uploaderHandler = new LocalChooseUploadHandler({
      oss: {
        STS: {
          OSSAccessKeyId: "acc", // 可以直接从STS拿到
          policy: "poli", // 可以直接从STS拿到
          Signature: "ssss", // 可以直接从STS拿到
          key: "22",
        },
        url: "https://xxxswwx.com",
      },
      exts: [],
      type: "all",
      count: 1,
    });
    expect(uploaderHandler.option()).toEqual({
      oss: {
        STS: {
          OSSAccessKeyId: "acc", // 可以直接从STS拿到
          policy: "poli", // 可以直接从STS拿到
          Signature: "ssss", // 可以直接从STS拿到
          key: "22",
          success_action_status: "200",
        },
        url: "https://xxxswwx.com",
        name: "file",
      },
      exts: [],
      type: "all",
      count: 1,
      size: 1024 * 1024 * 3,
    });
  });

  it("should trigger uploaded hook.", async () => {
    mockWx();
    const uploaderHandler = new Uploader(
      new LocalChooseUploadHandler({
        oss: {
          STS: {
            OSSAccessKeyId: "acc", // 可以直接从STS拿到
            policy: "poli", // 可以直接从STS拿到
            Signature: "ssss", // 可以直接从STS拿到
            key: "22",
          },
          url: "https://xxxswwx.com",
        },
        exts: [],
        type: "file",
        count: 1,
      })
    );
    const files = await uploaderHandler.upload();

    expect(files[0].url).not.toBe("");
  });

  it.todo("other tests to weapp tools");
});
