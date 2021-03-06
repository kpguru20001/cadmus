import { walletConnect, web3Modal } from "@/stores/wallet";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
      meta: {
        walletRequired: true,
      },
    },
    {
      path: "/swap",
      name: "swap",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/SwapView.vue"),
      meta: {
        walletRequired: true,
      },
    },
  ],
});

router.beforeEach((to, _, next) => {
  if (to.meta["walletRequired"] === true) {
    console.log(web3Modal.cachedProvider);
    if (web3Modal.cachedProvider !== "") {
      walletConnect();
      next();
    } else {
      next("/");
    }
  } else {
    next();
  }
});

export default router;
