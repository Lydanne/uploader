<template>
  <div class="upload">
    <el-card>
      <template #header>
        <div class="head">
          <el-button class="back" size="mini" @click="viewter.to('home')"
            >返回</el-button
          >
          <span class="title">上传成绩</span>
          <a href="/" class="help">?</a>
        </div>
      </template>
      <div class="body">
        <p class="title">上传成绩表格，将智能识别表格内容</p>
        <div class="core">
          <el-upload
            class="upload-demo"
            drag
            action="https://jsonplaceholder.typicode.com/posts/"
            multiple
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <div class="el-upload__tip text-center" slot="tip">
              请在5分钟内上传jpg/png文件，且不超过500kb的文件。
            </div>
          </el-upload>
        </div>
        <p class="tip">温馨提示：<a href="/">点击查看帮助文档</a></p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { viewterKey } from "@/context/viewter";
import { defineComponent, inject } from "vue-demi";

export default defineComponent({
  setup() {
    const viewter = inject(viewterKey);

    return { viewter };
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
