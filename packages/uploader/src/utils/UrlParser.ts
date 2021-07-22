interface Url {
  url: string;
  protocol: string;
  domain: string;
  path: string;
  basePath: string;
  name: string;
  ext: string;
}

export class UrlParser {
  static parse(url: string) {
    const ext = UrlParser.ext(url);
    return {
      url,
      ext,
    };
  }

  static ext(url: string) {
    const [_, ext = ""] = url.match(/.(\w+)$/);
    return ext;
  }
}
