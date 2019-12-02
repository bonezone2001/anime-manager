<template>
  <div class="nav">
    <aside ref="sidebar" class="sidebar has-text-centered">
      <a id="togglebtn" @click="toggleSidebar()">&equiv;</a>
      <br />
      <img id="logo" alt="logo" src="../assets/logo.png" />
      <p class="menu-label" id="brand">
        <transition name="fade">
          <span v-if="!isCollapsed">Kyle Productions</span>
        </transition>
      </p>
      <ul class="menu-list">
        <router-link
          v-for="route in $router.options.routes"
          :key="route.path"
          :to="route.path"
          exact
        >{{ !isCollapsed ? route.name : route.icon }}</router-link>
        <transition-group name="fade-longer">
          <div class="extra-data" :key="this.$store.getters.currentHovered.name" v-if="!this.$store.getters.isCollapsed && this.$store.getters.currentHovered.name !== undefined">
            <p><span class="extra-text">Name</span> {{ this.$store.getters.currentHovered.name }}</p>
            <p><span class="extra-text">Score</span> {{ this.$store.getters.currentHovered.score }}</p>
            <p><span class="extra-text">Rank</span> {{ this.$store.getters.currentHovered.rank }}</p>
            <span class="extra-text">Description</span>
            <div class="description">
              {{ this.$store.getters.currentHovered.description }}
            </div>
          </div>
        </transition-group>
      </ul>
      <a v-if="['Watch', 'Watched'].includes($route.name)" id="addbtn" @click="openAddModal()">&plusmn;</a>
      <a v-else id="phbtn" @click="placeholder()">&#38632;</a>
    </aside>
  </div>
</template>

<script>
import AddRemoveAnime from "@/components/AddRemoveAnime.vue";

export default {
  name: "sidebar",
  data() {
    return {
      isCollapsed: false
    };
  },
  components: {
    AddRemoveAnime
  },
  methods: {
    toggleSidebar() {
      this.$refs.sidebar.style.width = this.isCollapsed ? "270px" : "50px";
      this.$refs.sidebar.classList.toggle("collapsed", !this.isCollapsed);
      this.isCollapsed = !this.isCollapsed;
      this.$store.commit("changeCollapse", this.isCollapsed);
    },
    openAddModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AddRemoveAnime,
        hasModalCard: true,
        props: {
            isWatched: ['Watched'].includes(this.$route.name)
        }
      });
    },
    firstUpper(data) {
      return data.charAt(0).toUpperCase() + data.slice(1);
    },
    placeholder() {
      alert("This does nothing... for now... 雨");
    }
  },
  created() {
      console.log(this.$router.currentRoute);
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
  color: white;
  background: rgb(0, 0, 0, 0.25);
}

.menu-list a.is-active {
  background: #ca4c1a;
}

#brand {
  margin-top: 0;
  overflow: hidden !important;
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
  padding: 0;
  font-size: 20px;
}

#togglebtn {
  position: absolute;
  color: white;
  font-size: 30px;
  left: 17px;
  top: -10px;
}

#addbtn {
  position: absolute;
  color: white;
  font-size: 30px;
  left: 17px;
  top: 20px;
}

#phbtn {
  position: absolute;
  color: white;
  font-size: 25px;
  left: 14px;
  top: 24px;
}

.extra-text {
  color: #ca4c1a
}

.extra-data {
  padding: 0 15px;
  white-space: normal;
  word-wrap: break-word
}

.description {
  width:90%;
  height: 200px;
  overflow:auto;
  margin: 5px auto;
  text-align: left;
  padding: 5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-longer-enter-active {
  transition: opacity 1s
}
.fade-longer-leave-active {
  transition: opacity 0.1s;
}
.fade-longer-enter,
.fade-longer-leave-to {
  opacity: 0;
}
</style>