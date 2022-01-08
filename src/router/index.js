import Vue from "vue";
import VueRouter from "vue-router";
import Layout from "@/components/Layout.vue";
Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    component: Layout,
    redirect: "/home",
    children: [
      {
        path: "/",
        name: "Home",
        component: () => import("../views/menu.vue"),
      },
      {
        path: "/splash",
        name: "Splash",
        component: () => import("../views/Splash.vue"),
        meta: {
          title: "闪屏",
        },
      },
      {
        path: "/setting",
        name: "setting",
        component: () => import("../views/Setting.vue"),
        meta: {
          title: "系统设置",
        },
      },
      {
        path: "/about",
        name: "About",
        component: () => import("../views/About.vue"),
        meta: {
          title: "关于",
        },
      },
    ],
  },
];
const router = new VueRouter({
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});
export default router;
