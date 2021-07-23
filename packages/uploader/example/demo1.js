/**
 * 请复制到 pages/teacher/publish/score/index.js 中测试，手机端上传
 **/

import { LocalChooseUploadHandler } from "@sharedkit/uploader";
import { UploaderFactory } from "../../../../utils/UploaderFactory";

// pages/teacher/publish/score/index.js
var app = getApp();
var util = app.require("utils/util.js");
var aliyunOss = app.require("utils/uploadoss/uploadAliyun.js");
const { getMembersByCid, getTeacherClass, excelScoreOcr } =
  app.require("utils/request");
const UUID = app.require("utils/uploadoss/UUID.js");
const config = app.require("config");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    steps: [
      {
        // text: '步骤一',
        desc: "上传成绩",
      },
      {
        // text: '步骤二',
        desc: "预览修正成绩",
      },
      {
        // text: '步骤三',
        desc: "提交发布",
      },
      {
        // text: '步骤四',
        desc: "分享",
      },
    ],
    active: 0,
    swiperList: [
      {
        url: "http://allsystemfile.welife001.com/miniprogram/bjxgj/ai/score1.png",
      },
      {
        url: "http://allsystemfile.welife001.com/miniprogram/bjxgj/ai/score2.png",
      },
    ],
    teacherClass: [],
    currentIndex: 0,
    selectModal: false,
    pushSuccessed: false,
    logVersion: new Date().getTime(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (prevPage) {
      _this.setData({
        teacherClass: prevPage.data.teacherClass,
        currentIndex: 0,
        selectModal: prevPage.data.teacherClass.length > 1,
      });
    } else {
      getTeacherClass({
        teacher_cate: "teach_class_list",
        role_detail_id: app.globalData.role_detail_id,
      })
        .then((res) => {
          console.log(res);
          if (res.classes.length > 0) {
            console.log(res.classes.length > 1);
            _this.setData({
              teacherClass: res.classes,
              currentIndex: 0,
              selectModal: res.classes.length > 1,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
  onOpenModal() {
    this.setData({
      selectModal: true,
    });
  },
  onChangeClass(e) {
    let _this = this;
    _this.setData({
      currentIndex: e.currentTarget.dataset.index,
    });
  },
  onConfirmModal() {
    this.setData({
      selectModal: false,
    });
  },
  pcTips() {
    wx.showModal({
      title: "上传成绩",
      content: "电脑端输入\nbanjixiaoguanjia.com/my\n到小管家网页版上传成绩",
      showCancel: false,
      cancelText: "取消",
      cancelColor: "#000000",
      confirmText: "我知道了",
      confirmColor: "#3B8AF2",
      success: (result) => {
        if (result.confirm) {
        }
      },
      fail: () => {},
      complete: () => {},
    });
  },
  chooseFile() {
    let _this = this;
    wx.showActionSheet({
      itemList: ["如何上传Excel", "从聊天会话中选取"],
      itemColor: "#000000",
      success: async (action) => {
        if (action.tapIndex == 0) {
          wx.navigateTo({
            url: "/example/common/webview/webview?href=https://mp.weixin.qq.com/s/FCJnY78LclvvipYIhxNAzw",
          });
        } else if (action.tapIndex == 1) {
          let cls = this.data.teacherClass[this.data.currentIndex];
          const option = {
            type: "file",
            exts: ["xlsx"],
            prefix: `/score/${cls.unique_code}`,
            count: 1,
          };

          const uploader = UploaderFactory.create(
            LocalChooseUploadHandler,
            option
          );
          const [file] = await uploader.upload().wait();

          let logs = {
            id: "上传成绩",
            action: "提交文件识别",
            type: "excel",
            cid: cls._id,
            url: file.url,
            c0: _this.data.logVersion,
          };
          excelScoreOcr({
            cid: cls._id,
            excelUrl: file.url,
          })
            .then((res) => {
              console.log(res);
              if (res.code == 0) {
                wx.hideLoading();
                if (res.data.header.length > 0) {
                  file.result = res.data;
                  logs.status = "ok";
                  app.addEvent(logs);
                  wx.showToast({
                    title: "AI识别成功",
                  });
                  _this.setData({
                    excelFile: file,
                  });
                  wx.navigateTo({
                    url: `/pages/teacher/publish/score/result?cid=${cls._id}&type=excel`,
                  });
                } else {
                  logs.status = "error";
                  logs.msg = res.data;
                  app.addEvent(logs);
                  wx.hideLoading();
                  wx.showModal({
                    title: "提示",
                    content: "格式有误,请重新选择上传",
                    showCancel: true,
                    cancelText: "我知道了",
                    cancelColor: "#000000",
                    confirmText: "查看教程",
                    confirmColor: "#3B8AF2",
                    success: (result) => {
                      if (result.confirm) {
                        wx.navigateTo({
                          url: "/example/common/webview/webview?href=https://mp.weixin.qq.com/s/qzyqtBeIVW7j-m2ceZUZaA",
                        });
                      }
                    },
                    fail: () => {},
                    complete: () => {},
                  });
                }
              } else {
                wx.hideLoading();
                wx.showModal({
                  title: "提示",
                  content: res.msg,
                  showCancel: true,
                  cancelText: "我知道了",
                  cancelColor: "#000000",
                  confirmText: "查看教程",
                  confirmColor: "#3B8AF2",
                  success: (result) => {
                    if (result.confirm) {
                      wx.navigateTo({
                        url: "/example/common/webview/webview?href=https://mp.weixin.qq.com/s/qzyqtBeIVW7j-m2ceZUZaA",
                      });
                    }
                  },
                  fail: () => {},
                  complete: () => {},
                });
              }
            })
            .catch((err) => {
              console.log(err);
              logs.status = "error";
              logs.msg = err;
              app.addEvent(logs);
            });
        }
      },
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
