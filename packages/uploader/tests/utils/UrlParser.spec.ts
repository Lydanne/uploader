import { UrlParser } from "./../../src/utils/UrlParser";

describe("UrlParser.ts", () => {
  it("should match", () => {
    const url =
      "https://campusfile.welife001.com/upload/9321/1626941095340.xlsx";

    const urlRes = UrlParser.parse(url);

    expect(urlRes.url).toBe(url);
    // expect(urlRes.protocol).toBe("https");
    // expect(urlRes.domain).toBe("campusfile.welife001.com");
    // expect(urlRes.basePath).toBe("/upload/9321");
    // expect(urlRes.name).toBe("1626941095340");
    expect(urlRes.ext).toBe("xlsx");
    // expect(urlRes.path).toBe("/upload/9321/1626941095340.xlsx");
  });
});
