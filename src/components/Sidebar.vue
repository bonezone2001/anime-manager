<template>
  <div class="nav">
    <aside ref="sidebar" class="sidebar has-text-centered">
      <a id="togglebtn" @click="toggleSidebar()">&equiv;</a>
      <br />

      <!-- LOGO -->
      <svg id="logo" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 216" :style="{ 'background-image': 'url(' + require(`../assets/eye-${this.$store.getters.theme == 'dark' ? 'w' : 'b'}.png`) + ')', 'background-size': 'cover'}">
        <path
          v-bind:fill="this.$store.getters.accentCol"
          d="M96 1C57.5 5.5 24.2 30.5 9 66.1c-23.1 54.4 2.4 117.6 57 140.8 31.9 13.6 67.7 11 97.9-7.1 7-4.1 20.2-14.8 16.6-13.3-14 5.7-37.1 10-48.3 9-6.8-.6-17.6-3.7-18.6-5.3-.3-.4 5.5-.8 12.7-.8 19.9.1 36.3-3.7 52.9-12 8.7-4.4 19.6-11.4 20.2-13.1.3-.8-1.4-2.3-4.2-3.6-8.8-4.4-13.7-5.2-32-5.2-9.4 0-17.2-.1-17.2-.3 0-1.4 14.8-6.7 22.7-8.1l9.8-1.8-9-2.1c-27.5-6.5-51.2-4.8-82 5.9-19.6 6.7-35.7 6.6-49.7-.4-3.5-1.7-8.4-5.2-10.9-7.8-5.2-5.3-9.9-13.9-9.9-18 0-2.4.5-2.7 5.6-3.7 10.7-2.2 18.5-7.4 35.5-23.8 16.8-16.2 20.4-18.5 31.4-20.6 6.5-1.2 6.6-1.3 7.7-5.3 2.1-7.2 1.4-17.4-1.6-24.1-1.5-3.2-3.5-6.7-4.4-7.8-1.7-1.8-1.6-1.9 4.6-1.2 14.5 1.6 31.1 8 44.9 17.2 26.5 17.9 49.7 53.3 60.3 92 1.1 4.3 2.3 8.6 2.6 9.4.7 2 5.9-10.3 8.5-19.9C225.8 83 198.3 28.6 148 8.3 131.1 1.4 113.5-1 96 1z"
        />
      </svg>

      <p class="menu-label" id="brand">
        <transition name="fade">
          <span v-if="!$store.getters.isCollapsed">Kyle Productions</span>
        </transition>
      </p>
      <ul class="menu-list">
        <router-link
          v-for="route in $router.options.routes"
          :key="route.path"
          :to="route.path"
          exact
        >{{ !$store.getters.isCollapsed ? route.name : route.icon }}</router-link>
      </ul>
      <a
        v-if="['Watch', 'Watched'].includes($route.name)"
        id="addbtn"
        @click="openAddModal()"
      >&plusmn;</a>
      <a v-else id="phbtn" @click="">&#38632;</a>
    </aside>
  </div>
</template>

<script>
import AddRemoveAnime from "@/components/AddRemoveAnime.vue";

export default {
  name: "Sidebar",
  methods: {
    toggleSidebar() {
      this.$refs.sidebar.classList.toggle(
        "collapsed",
        !this.$store.getters.isCollapsed
      );
      this.$store.commit("changeCollapse", !this.$store.getters.isCollapsed);
    },
    openAddModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AddRemoveAnime,
        hasModalCard: true,
        props: {
          isWatched: ["Watched"].includes(this.$route.name)
        }
      });
    }
  }
};
</script>

<style scoped>
a {
  overflow: hidden !important;
  margin-bottom: 5px;
  -webkit-user-drag: none;
}

.menu-list a:hover {
  cursor: default;
  color: var(--textCol);
  background: rgb(0, 0, 0, 0.25);
}

.is-active {
  color: var(--accentText) !important;
}

.menu-list a.is-active {
  background: var(--accent);
}

#brand {
  margin-top: 0;
  overflow: hidden !important;
  color: var(--textCol) !important;
}

.collapsed #brand {
  margin: 0 0 5px 0;
}

#logo {
  width: 40%;
  transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s;
  -webkit-user-drag: none;
}

.collapsed #logo {
  width: 70%;
  transition: cubic-bezier(0.455, 0.03, 0.515, 0.955) 0.7s;
  margin-top: 35px;
}

.sidebar {
  position: fixed;
  height: 100%;
  padding: 15px 0;
  width: 270px;
  overflow: hidden !important;
  transition: 0.5s;
  white-space: pre;
}

.sidebar.collapsed {
  width: 50px;
  padding: 0;
  font-size: 20px;
}

#togglebtn {
  position: absolute;
  color: var(--textCol);
  font-size: 30px;
  left: 17px;
  top: -10px;
}

#addbtn {
  position: absolute;
  color: var(--textCol);
  font-size: 30px;
  left: 17px;
  top: 20px;
}

#phbtn {
  position: absolute;
  color: var(--textCol);
  font-size: 25px;
  left: 14px;
  top: 24px;
}
</style>