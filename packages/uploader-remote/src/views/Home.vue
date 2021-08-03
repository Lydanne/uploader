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
          autofocus
          @keypress.enter.native="onSubmit"
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
import { open } from "@/api/uploader-pipe";
import { wrap } from "@/utils/wrap";
import { getQ } from "@/utils/getQ";
import { Message } from "element-ui";
import { axios } from "@/utils/axios";
import { useRouter } from "@/hooks/useRouter";

export default defineComponent({
  setup() {
    const code = ref(getQ());
    const router = useRouter();

    async function onSubmit() {
      const [v2Err, v2Res] = await wrap(open(code.value));

      if (!v2Err) {
        Message.success("传输码正确");
        return router?.push({ name: "uploadv2", params: v2Res.data });
      }

      const [v1Err] = await wrap(uploadv1());

      if (!v1Err) {
        Message.success("传输码正确");
        return router?.push({ name: "uploadv1", params: { code: code.value } });
      }

      if(v2Err && v2Err.msg){
        return Message.error(v2Err.msg);
      }
      return Message.error("传输码错误，请输入正确的传输码");

      async function uploadv1() {
        let result = await axios.post("/getTransCodeContent", {
          trans_code: code.value,
        });

        if (result.data && result.data == "1") {
          return true;
        } else {
          throw new Error("uploadV1传输码错误");
        }
      }
    }
    return {
      code,
      onSubmit,
    };
  }
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
