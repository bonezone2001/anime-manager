import Vue from "vue";          // Vue main
import App from "./App.vue";    // Main app component
import Buefy from 'buefy';      // Buefy (CSS Framework, similar to bootstrap)
import router from "./router";  // Router used for routing pages within SPA
import store from "./store";    // Store library for global state
import 'buefy/dist/buefy.css';  // CSS Framework's styling

// Setup
Vue.use(Buefy);
Vue.config.productionTip = false;

// Create vue root
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
