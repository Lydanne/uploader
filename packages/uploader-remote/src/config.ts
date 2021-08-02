const defaultConfig = {
  baseURL: "",
  ossBucketMap: {
    record: "https://campusrecord.welife001.com",
    video: "https://campusvideo.welife001.com",
    img: "https://campus002.welife001.com",
    answer_img: "https://campus002.welife001.com",
    file: "https://campusfile.welife001.com",
    album: "https://album.welife001.com",
    disk: "https://disk.welife001.com", //网盘文件
  },
};

if (import.meta.env.DEV) {
  Object.assign(defaultConfig, {
    baseURL: "/proxy",
  } as typeof defaultConfig);
}

export default defaultConfig;
