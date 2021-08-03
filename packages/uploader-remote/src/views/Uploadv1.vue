<template>
  <div class="rosterContent">
    <div class="r-title">
      <el-button v-show="showUpload" plain class="r-t-btn" v-on:click="backend"
        >返回</el-button
      >
      班级小管家文件导入
    </div>

    <!-- <div v-if="loginState" class="uploadLogin" v-cloak>

                <div style="color: #666;">在下方输入传输码，即可开始上传</div>
                <div>
                    <el-input style="width: 200px;margin: 20px;"  v-model="input" placeholder="在此输入传输码" @keyup.enter.native="login"></el-input>
                </div>
                <div>
                    <el-button style="width:200px" type="primary"  v-on:click="login">确认</el-button>
                </div>
    
            </div> -->

    <div v-show="showTips" v-cloak>
      <div class="rosterTips">
        <div style="margin: 10px 6px">班级名单上传须知</div>

        <span class="roster-tips red"
          >Excel表格中，必须包含有 [姓名] 列，如下图</span
        >
        <span class="roster-tips"
          >Excel可增加 [手机号] 列，可以一键短信邀请学生加入班级</span
        >
      </div>
      <img
        src="https://allsystemfile.oss-cn-beijing.aliyuncs.com/miniprogram/bjxgj/ai/excel01.png"
        class="image"
      />
      <div class="bottom">
        <el-button type="primary" class="button" v-on:click="startUpload"
          >开始导入</el-button
        >
      </div>
    </div>

    <div class="rosterContent" v-cloak>
      <div class="r-title1">上传班级名单文件，将智能识别班级成员并导入</div>
      <el-upload
        class="upload-demo"
        drag
        accept=".xls,.xlsx"
        action=""
        :before-upload="beforeUploadFile"
        :http-request="uploadFile"
        multiple
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
        :on-preview="handlePreview"
        :file-list="fileLists"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">
          只能上传.xls,.xlsx文件，且不超过10M
        </div>
      </el-upload>

      <div class="bottom">
        <el-button
          type="primary"
          class="button"
          :disabled="disabled"
          v-on:click="saveBtn"
          >同步到班级小管家</el-button
        >
      </div>
    </div>

    <div class="r-footer">
      温馨提示：<a
        href="https://mp.weixin.qq.com/s/FCJnY78LclvvipYIhxNAzw"
        target="_blank"
        >点击查看帮助文档</a
      >
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Message, MessageBox } from "element-ui";
import config from "@/config";
const host = config.baseURL;

export default {
  data() {
    console.log(this);
    return {
      loginState: true,
      showUpload: false,
      showTips: false,
      showRoster: false,
      str: "说明",
      fileLists: [],
      filesPath: [], //文件路径
      fileNames: [], //文件名
      roster: [],
      input: "",
      ossData: null,
      ossAddr: "",
      trans_code: "",
      disabled: false,
    };
  },
  methods: {
    $message: Message,
    login: async function () {
      let that = this;
      let trans_code = this.input;
      console.log(trans_code);
      //this.loginState = true
      //验证传输码是否有效
      try {
        let result = await axios.post(host + "/getTransCodeContent", {
          trans_code,
        });
        //console.log(result)

        if (result.data.data && result.data.data == "1") {
          //
          that.showTips = true;
          that.loginState = false;
        } else {
          Message.error("传输码错误");
        }
      } catch (error) {
        console.log(error);
      }
    },
    startUpload: function () {
      this.showUpload = true;
      this.showTips = false;
      this.disabled = true;
      (this.fileLists = []),
        (this.filesPath = []), //文件路径
        (this.fileNames = []); //文件名
    },
    backend: function () {
      this.$router.back();
    },
    handleExceed: function () {
      Message.error("只能上传一份班级名单");
    },
    handleRemove: function (file, fileList) {
      console.log(file);
      let nameIndex = "-1";
      this.fileNames.forEach((item, index) => {
        if (item && item.indexOf(file.name) >= 0) {
          nameIndex = index;
        }
      });
      if (nameIndex != "-1") {
        this.fileNames.splice(nameIndex, 1);
        this.filesPath.splice(nameIndex, 1);
      }

      console.log(this.filesPath);
      if (this.filesPath.length == 0) {
        this.disabled = true;
      }
      console.log(this.filesPath);
    },
    handlePreview: function (file) {
      console.log(file);
      console.log(this.filesPath);
    },
    //处理文件大小限制
    beforeUploadFile: async function (file) {
      console.log("before upload");
      console.log(file.name);
      console.log(this.fileNames);
      console.log(this.fileLists);
      let filename = file.name;
      let result = true;
      let errMsg = "";
      //文件名
      this.fileNames.some((item) => {
        if (item && item.indexOf(filename) != -1) {
          result = false;
          errMsg = "请不要上传重复文件";
          return true;
        } else {
          return false;
        }
      });
      // 文件大小
      let size = file.size / 1024 / 1024;
      if (size > 10) {
        result = false;
        errMsg = "文件大小不得超过10M";
      }
      console.log(result);

      if (result && errMsg) {
        // Message.warning({
        // type: 'warning',
        // message: errMsg
        // });
        return false;
      }
    },
    //自定义上传文件方法
    uploadFile: async function (param) {
      let _this = this;
      console.log(param);
      const file = param.file;
      let filename = param.file.name;

      let result = false;
      let errMsg = "";
      // //文件名
      // this.fileNames.some(item=>{
      //     if(item&&item.indexOf(filename)!=-1){
      //         result = true
      //         errMsg = "请不要上传重复文件"
      //         return true
      //     }else{
      //         return false
      //     }
      // })
      // // 文件大小
      // let size = file.size / 1024 / 1024
      // if(size > 10) {
      //     result = true
      //     errMsg = "文件大小不得超过10M"
      // }
      // console.log(result)

      // if(result&&errMsg){
      //     return false
      //     // Message.warning({
      //     // type: 'warning',
      //     // message: errMsg
      //     // });

      // }

      let ext = filename.split(".")[filename.split(".").length - 1];
      // object表示上传到OSS的名字，可自己定义
      // file浏览器中需要上传的文件，支持HTML5 file 和 Blob类型
      let ossData = this.ossData;
      let ossAddr = "https://campusfile.welife001.com";
      _this.ossAddr = ossAddr;
      let path = "upload/" + _this.input + "/" + file.uid + "." + ext;
      console.log(path);
      var formData = new FormData();
      formData.append("OSSAccessKeyId", ossData.OSSAccessKeyId);
      formData.append("policy", ossData.policy);
      formData.append("Signature", ossData.signature);
      formData.append("success_action_status", 200);
      formData.append("key", path);
      formData.append("file", file);
      try {
        //验证传输码是否有效
        let filePath = await axios.post(host + "/getTransCodeContent", {
          trans_code: _this.input,
        });
        if (filePath.data.code != 0 || !filePath.data.data) {
          // Message.error("传输码已过期，请重新输入");
          MessageBox.confirm("传输码已过期，请重新输入", "提示", {
            confirmButtonText: "确定",
            showCancelButton: false,
            type: "error",
          }).then(() => {
            _this.showTips = false;
            _this.showUpload = false;
            _this.loginState = true;
            _this.input = "";
          });
          return;
        }
        //开始上传oss
        let result = await axios.post(ossAddr, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(result);
        if (result.status == 200) {
          _this.filesPath.push(ossAddr + "/" + path);
          _this.fileNames.push(filename);
          this.disabled = false;
          console.log(_this.filesPath);
          addEvent({
            cate: "电脑端上传",
            p1: "v1",
            id: "上传文件",
            platform: "web",
            status: "ok",
          });
        } else {
          addEvent({
            cate: "电脑端上传",
            p1: "v1",
            id: "上传文件",
            platform: "web",
            status: "error",
            msg: result,
          });
          Message.error("导入文件出现异常，请重新上传");
        }
      } catch (error) {
        console.log("error:", error);
        Message.error(error);
      }
    },
    //更新文件地址到Redis
    saveBtn: async function () {
      //let _this = this
      // let filesStr = this.filesPath.map(item=>{
      //     return _this.ossAddr+"/upload/"+encodeURI(item)
      // }).join(";")
      let filesStr = this.filesPath.join(";");
      let that = this;

      if (!filesStr) {
        Message.error("请先完成文件上传或者检查传输码！");
        return;
      }
      //验证传输码是否有效
      let filePath = await axios.post(host + "/getTransCodeContent", {
        trans_code: that.input,
      });
      if (filePath.data.code != 0 || !filePath.data.data) {
        Message.error("传输码已过期，请重新输入");
        return;
      }
      //同步文件信息
      axios
        .post(host + "/setTransCodeContent", {
          trans_code: that.input,
          files: filesStr,
        })
        .then((res) => {
          console.log(res);
          if (res.data.code == 0) {
            MessageBox.confirm("导入完毕，请到小程序中查看结果", "操作成功", {
              confirmButtonText: "确定",
              showCancelButton: false,
              type: "success",
            }).then(() => {
              that.showTips = false;
              that.showUpload = false;
              that.loginState = true;
              that.input = "";
              (this.fileLists = []),
                (this.filesPath = []), //文件路径
                (this.fileNames = []); //文件名
              this.backend();
            });
            addEvent({
              cate: "电脑端上传",
              p1: "v1",
              id: "同步文件地址",
              platform: "web",
              status: "ok",
            });
          } else {
            addEvent({
              cate: "电脑端上传",
              p1: "v1",
              id: "同步文件地址",
              platform: "web",
              status: "error",
              msg: res,
            });
            Message.error("文件信息更新失败，请重试！");
            this.backend();
          }
        })
        .catch((err) => {
          Message.error("文件信息更新失败，请重试！");
          this.backend();
        });
    },
  },
  created() {
    let that = this;
    this.input = this.$route.params.code;
    that.startUpload();
    axios.post(host + "/applet/getOssParams").then((res) => {
      console.log(res);
      that.ossData = res.data.data;
    });

    addEvent({
      cate: "电脑端上传",
      p1: "v1",
      id: "网址进入",
      platform: "web",
      status: "ok",
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
body {
  background: #e9eaeb;
  display: flex;
  /* align-items: center; */
  justify-content: center;
}

[v-cloak] {
  display: none;
}
.rosterContent {
  width: 800px;
  height: 650px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 80px;
  flex-direction: column;
  position: relative;
}
.upload-demo {
  width: 600px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.r-title {
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 65px;
  width: 100%;
  background-color: #e2e2e2;
  font-size: 24px;
  color: #333;
}
.r-title1 {
  color: #999;
}
.r-t-btn {
  position: absolute;
  left: 30px;
  background-color: #f2f2f2;
}
.r-footer {
  font-size: 12px;
  color: #999;
  position: absolute;
  bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
a {
  color: #999;
}
.rosterHelp {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.rosterTips {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin: 20px 0;
}
.roster-tips {
  margin: 5px;
  font-size: 14px;
  line-height: 14px;
  color: #999999;
}
.red {
  color: #d81e06;
}
.roster-tips:before {
  width: 12px;
  height: 12px;
  display: inline-block;
  content: "";
  background: radial-gradient(#1994fc 3px, #e6f4ff 3px);
  border: 1px solid rgba(0, 154, 225, 0.1);
  border-radius: 12px;
  margin-right: 10px;
  vertical-align: top;
}
.image {
  width: 600px;
  height: 300px;
}
.bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}
.rosterList {
  background-color: #f2f2f2;
}
.rosterItem {
  display: flex;
  width: 400px;
}
.r-item {
  flex: 1;
  align-items: center;
  justify-content: center;
  display: flex;
}
.r-item-h {
  flex: 1;
  background-color: #e2e2e2;
  align-items: center;
  justify-content: center;
  display: flex;
}
.uploadLogin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
