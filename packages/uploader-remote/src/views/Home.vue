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
          focus
        ></el-input>
        <el-button class="submit" type="primary" @click="onSubmit"
          >上传导入</el-button
        >
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref } from "vue-demi";
import { viewterKey } from "@/context/viewter";
import { open } from '@/api/uploader-pipe'
import { wrap } from '@/utils/wrap'
import { getQ } from '@/utils/getQ'
import { Message } from 'element-ui';
import { axios } from "@/utils/axios";


export default defineComponent({
  setup() {
    const viewter = inject(viewterKey);
    const code = ref(getQ());

    async function onSubmit() {
      const [err, res] = await wrap(open(code.value))

      if(err){
        const [err]  = await wrap(oldUploadv1())
        console.log(err);
        
        if(err){
          return Message.error('传输码错误，请输入正确的传输码')
        }
        viewter?.to("uploadv1", { code: code.value });
        return;
      }

      viewter?.to("uploadv2", res.data);

      async function oldUploadv1() {
        let result = await axios.post("/getTransCodeContent", {
          trans_code: code.value,
        });
        //console.log(result)

        if (result.data && result.data == "1") {
          return true
        } else {
          throw new Error('uploadV1传输码错误')
        }
      }
    }
    return {
      code,

      onSubmit,
    };
  },
  created(){
    console.log();

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