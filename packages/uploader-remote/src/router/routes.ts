import { RouteConfig } from "vue-router";
import Home from "@/views/Home.vue";

export const routes: RouteConfig[] = [
  {
    path: "/",
    name: 'home',
    component: Home,
  },
  {
    path: '/uploadv1',
    name: 'uploadv1',
    component: () => import('@/views/Uploadv1.vue')
  },
  {
    path: '/uploadv2',
    name: 'uploadv2',
    component: () => import('@/views/Uploadv2.vue')
  }
];
