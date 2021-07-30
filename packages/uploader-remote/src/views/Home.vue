<template>
  <div class="home">
    <div class="info">
      <p>https://<span class="higt">bjxgj.com/c</span></p>
      <p>班级小管家的拼音简写</p>
    </div>
    <div class="card">
      <el-card>
        <div class="tip">请在下方输入传输码</div>
        <el-input
          class="input"
          v-model="code"
          placeholder="请输入传输码"
          size="normal"
          clearable
        ></el-input>
        <el-button class="submit" type="primary" @click="onSubmit"
          >上传导入</el-button
        >
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue-demi";
import { viewterKey } from "@/context/viewter";

export default defineComponent({
  setup() {
    const viewter = inject(viewterKey);
    const code = ref("");

    function onSubmit() {
      viewter?.to("upload");
    }
    return {
      code,

      onSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
.home {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.info {
  text-align: center;
  font-size: 16px;
  color: #999;
  margin-bottom: 30px;
  .higt {
    color: #0091ff;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 1px;
  }
}
.card {
  text-align: center;
  width: 30vw;
  .tip {
    color: #666;
    padding: 32px 0;
    font-size: 14px;
  }
  .input {
    display: block;
    margin: 0 19%;
    width: 60%;
    margin-bottom: 28px;
  }
  .submit {
    margin-bottom: 28px;
  }
}
</style>
