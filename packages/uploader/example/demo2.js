/**
 * 请复制到 pages/teacher/classManage/uploadEx/index.js 中测试，电脑端上传
 */
import { RemoteUploadHandler } from "@sharedkit/uploader";
import { UploaderFactory } from "../../../../utils/UploaderFactory";

let app = getApp();

let {
  photoAiOcr,
  getClassById,
  excelAiOcr,
  createClsOperate,
  getClsOperate,
  getUniqueTransCode,
  getTransCodeContent,
  delTransCodeContent,
} = app.require("utils/request");

let that;

var count = 1;

const option = {
  exts: ["xlsx"],
  count: 1,
};

let uploader = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    unique_code: "",
    cid: "",
    cls: null,
    trans_code: "",
    timer: null,
  },

  //文件解析
  fileAnalyse(excelUrl) {
    this.data.excelFile = {};
    wx.showLoading({
      title: "花名册识别中...",
      mask: true,
    });

    let excelParam = {
      excelUrl: encodeURI(excelUrl), //: `http://campusfile.welife001.com/${newName}`
    };
    let excelOcrLog = {
      id: "班级识别",
      action: "提交文件识别",
      type: "excel",
      cid: this.data.cid,
      c0: 0,
      c1: this.data.cls.number,
      url: excelParam.excelUrl,
      from: "web",
    };

    excelAiOcr(excelParam)
      .then((res) => {
        if (!res || res.code !== 0 || !res.data) {
          wx.showToast({
            title: res.msg,
            icon: "none",
            duration: 2000,
          });
          wx.hideLoading();
          excelOcrLog.status = "error";
          app.addEvent(excelOcrLog);
          return;
        }
        if (res.data.length < 6) {
          wx.showModal({
            title: "提示",
            content: "识别人数少于6人",
            showCancel: true,
            cancelText: "取消",
            cancelColor: "#000000",
            confirmText: "去查看",
            confirmColor: "#576B95",
            success: (result) => {
              if (result.confirm) {
                count++;
                wx.navigateTo({
                  url: `/example/common/webview/webview?href=https://mp.weixin.qq.com/s/-1iOHkcdKFDUgeU_RHfYSA`,
                });
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                });
              }
            },
          });
          wx.hideLoading();
          excelOcrLog.status = "error";
          excelOcrLog.msg = "识别人数少于6人";
          app.addEvent(excelOcrLog);
          return;
        }
        wx.hideLoading();
        that.data.excelFile.result = res.data;
        that.data.excelFile.name = "花名册";
        wx.showToast({
          title: "花名册识别成功",
          icon: "success",
        });
        excelOcrLog.status = "ok";
        excelOcrLog.msg = "";
        app.addEvent(excelOcrLog);
        createClsOperate({
          cid: that.data.cid,
          type: 1,
          remark: {
            status: "ok",
            file: [excelParam.excelUrl],
          },
          result: [that.data.excelFile.result],
        });
        count++;
        wx.navigateTo({
          url: `/example/common/class/teachershow/ai/result?cid=${that.data.cid}&type=excel`,
        });
      })
      .catch((err) => {
        excelOcrLog.status = "error";
        excelOcrLog.msg = `服务端出错 ${JSON.stringify(err)}`;
        app.addEvent(excelOcrLog);
      });
  },
  toHelp() {
    count++;
    wx.navigateTo({
      url: "/example/common/webview/webview?href=https://mp.weixin.qq.com/s/FCJnY78LclvvipYIhxNAzw",
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    that = this;
    uploader = UploaderFactory.create(RemoteUploadHandler, option);
    let cls = JSON.parse(options.cls);

    this.setData({
      unique_code: cls.unique_code,
      cid: cls._id,
      cls: cls,
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    uploader.on("createdCode", (code) => {
      this.setData({
        trans_code: code,
      });
    });

    const [file] = await uploader.upload().wait();

    this.fileAnalyse(file.url);

    return;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    uploader.destroy();
  },
});
