<template>
  <div class="upload">
    <el-card>
      <template #header>
        <div class="head">
          <el-button class="back" size="mini" @click="viewter.to('home')"
            >返回</el-button
          >
          <span class="title">上传{{ limit.scene }}</span>
          <a :href="limit.helpUrl" class="help">?</a>
        </div>
      </template>
      <div class="body">
        <p class="title">上传文件，将智能识别文件内容</p>
        <div class="core">
          <el-upload
            class="upload-demo"
            ref="upload"
            action
            drag
            multiple
            :accept="limitExts"
            :limit="limit.count"
            :before-upload="beforeUpload"
            :http-request="uploadFile"
            :on-exceed="onOverCount"
            :on-success="onSuccess"
            :on-error="onError"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <div class="el-upload__tip text-center" slot="tip">
              请在{{ limit.maxAge / 60 }}分钟内上传{{
                limit.exts.join("/")
              }}文件，且不超过{{ limitSize }}MB的文件。
            </div>
          </el-upload>
        </div>
        <p class="tip">
          温馨提示：<a :href="limit.helpUrl">点击查看帮助文档</a>
        </p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { osssts, sendFiles, close } from "@/api/uploader-pipe";
import config from "@/config";
import { viewterKey } from "@/context/viewter";
import { axios } from "@/utils/axios";
import { wrap } from "@/utils/wrap";
import { FileMeta } from "@sharedkit/uploader";
import { Message, MessageBox } from "element-ui";
import { computed, defineComponent, inject, ref } from "vue-demi";

export default defineComponent({
  setup() {
    const viewter = inject(viewterKey);
    const limit = viewter?.params;

    const limitExts = computed(() =>
      limit.exts.map((e: string) => "." + e).join()
    );
    const limitSize = computed(() => limit.size / 1024 / 1024);

    function beforeUpload(file: any) {
      if (file.size / 1024 > limit.size) {
        return Message.warning(
          "文件超出限制，单文件最大" + limitSize.value + "MB"
        );
      }

      return true;
    }

    const files: FileMeta[] = [];
    async function uploadFile(upFile: any) {
      console.log(upFile);
      await uploadOss();
      console.log(files);

      async function uploadOss() {
        const [_, ext = ""] = upFile.file.name.match(/(\.\w+)$/);
        const filePath = limit.prefix + "/" + upFile.file.uid + ext;
        const [err, ossData]: any = await wrap(osssts(limit.code).then((res) => res.data));
        if(err){
          await MessageBox.alert('传输码失效，请重新上传')
          viewter?.to('home')
          return;
        }
        const formData = new FormData();
        formData.append("OSSAccessKeyId", ossData.OSSAccessKeyId);
        formData.append("policy", ossData.policy);
        formData.append("Signature", ossData.Signature);
        formData.append("success_action_status", ossData.success_action_status);
        formData.append("key", filePath.substr(1));
        formData.append("file", upFile.file);
        const ossUrl = (config as any).ossBucketMap[limit.cate];

        await axios.post(ossUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        files.push({
          name: upFile.file.uid,
          size: upFile.file.size * 1024,
          type: "file",
          ext: ext.substr(1),
          url: ossUrl + filePath,
          urlPath: filePath,
          path: upFile.file.name,
          time: upFile.file.lastModified,
        });
      }
    }

    function onOverCount() {
      Message.warning("文件数量超出限制");
    }

    const upload = ref()
    async function onSuccess() {
      const [cancel] = await wrap(MessageBox.confirm('上传成功，是否同步到手机端'))
      if(cancel){
        upload.value.clearFiles()
      }else{
        const [err] = await wrap(sendFiles(limit.code, files))
        if(err){
          await MessageBox.alert('传输码失效，请重新上传')
        }
        await MessageBox.alert('同步成功，请查看手机端')
        await close(limit.code)
        viewter?.to('home')
      }
    }

    function onError() {
      Message.warning("上传失败");
    }

    return {
      viewter,
      limit,
      limitExts,
      limitSize,
      upload,
      uploadFile,
      beforeUpload,
      onOverCount,
      onSuccess,
      onError
    };
  },
});
</script>

<style lang="scss" scoped>
.upload {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .back {
    width: 60px;
  }
  .title {
    color: #333333;
    font-size: 24px;
  }
  .help {
    display: inline-block;
    width: 60px;
    color: #333333;
    text-align: center;
    cursor: pointer;
    border: 1px solid #fff;
    transition: 0.36s all;
    &:hover {
      border-color: #eee;
      border-radius: 3px;
    }
  }
}
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60vw;
  height: 60vh;
  overflow: hidden;
  .title {
    color: #333333;
    font-size: 14px;
  }
  .core {
    margin: 33px 0;
  }
  .tip {
    color: #999999;
    font-size: 14px;
    a {
      color: #1c90ff;
      padding-bottom: 1px;
      text-decoration: none;
      border-bottom: 1px dashed #1c90ff;
    }
  }
}

.text-center {
  text-align: center;
}
</style>
