import Vue from "vue";
import App from "@/App.vue";
import { createApp, h } from "vue-demi";
import { Button, Card, Input, Upload } from "element-ui";
import "./app.scss";

Vue.config.productionTip = false;
Vue.config.devtools = true;

const app = createApp({
  render: () => h(App),
});

app.use(Button).use(Card).use(Input).use(Upload);

app.mount("#app");
