import VueRouter from "vue-router";
import { routes } from "./routes";

export const router = new VueRouter({
  mode: 'hash',
  routes,
});

router.beforeEach((to, from, next)=>{
  if(to.name === 'home'){
    return next()
  }
  if(to.params.code){
    return next()
  }
  next({ name: 'home' })
})