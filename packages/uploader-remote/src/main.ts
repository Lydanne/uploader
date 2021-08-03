import App from "@/App.vue";
import { createApp, h, install } from "vue-demi";
import { Button, Card, Input, Upload } from "element-ui";
import "./app.scss";
import { router } from "./router";
import { __DEV__ } from "./config";
import VueRouter from "vue-router";

install()

const app = createApp({
  router,
  render: () => h(App),
});

app.use(VueRouter)
app.use(Button).use(Card).use(Input).use(Upload);
app.config.productionTip = false;
app.config.devtools = __DEV__;

app.mount("#app");
