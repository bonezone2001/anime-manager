import Vue from "vue";          // Vue main
import App from "./App.vue";    // Main app component
import buefy from 'buefy';      // Buefy (CSS Framework)
import router from "./router";  // Router used for routing pages within SPA
import store from "./store";    // Store library for global state
import 'buefy/dist/buefy.css';  // CSS Framework's styling

// Setup
Vue.use(buefy, {
  defaultIconPack: 'fas'
});

Vue.config.productionTip = false;

var provider = "twist-moe";

// Globals (ew I know but I'm lazy)
Vue.prototype.$siteClass = require(`./sites/${provider}`);  // Class for searching anime sites (twist.moe/9anime/etc.)
Vue.prototype.$site = new Vue.prototype.$siteClass();       // Singleton of the site class
Vue.prototype.$loadedAnime = [];                            // All the anime currently displayed

Vue.prototype.$downloadInterval = null;   // The dequeue loop for downloading
Vue.prototype.$downloadQueue = [];        // A queue for storing up downloads

// Initialize vue
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');