import Vue from "vue";
import VueRouter from "vue-router";
import Watch from "../views/Watch.vue";

Vue.use(VueRouter);

// Page routes, they're pretty easy to understand, the only difference
// with my routes is that they iclude 'icon' since i generate the sidebar
// buttons automatically by looping through all the loops so i just put the
// icons here so it knows what icon to use when collapsed
const routes = [{
    path: "/",
    name: "Watch",
    icon: '\u25ba',
    component: Watch
  },
  {
    path: "/watched",
    name: "Watched",
    icon: '\u25c0',
    props: { isWatched: true },
    component: Watch
  },
  {
    path: "/options",
    name: "Options",
    icon: '\u2699',
    component: () =>
      import("../views/Options.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  linkActiveClass: 'is-active',
  base: process.env.BASE_URL,
  routes
});
router.replace('/');

export default router;