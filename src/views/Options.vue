<template>
  <div id="main" class="indent" :class="this.$store.getters.isCollapsed ? 'collapsed' : ''">
    <p class="title is-5 theme-text">APPEARANCE</p>
    <div class="columns">
      <div class="column">
        <p class="subtitle is-6 theme-text">Accent</p>
        <chrome-picker style="margin:0 auto" v-model="accentColor"/>
      </div>
      <div class="column">
        <p class="subtitle is-6 theme-text">Theme</p>
        <div class="buttons">
            <b-button :class="this.$store.getters.theme != 'dark' || 'active'" @click="changeTheme('dark')" type="is-dark" expanded outlined>Midnight</b-button>
            <b-button :class="this.$store.getters.theme != 'light' || 'active'" @click="changeTheme('light')" type="is-dark" expanded outlined>Whiteness</b-button>
        </div>
        <p class="subtitle is-6 theme-text">Anime Detail Preference</p>
        <div class="buttons">
            <b-button type="is-dark" expanded outlined>Details as card overlay</b-button>
            <b-button type="is-dark" expanded outlined>Details on sidebar (minimal)</b-button>
            <b-button type="is-dark" expanded outlined>Details on sidebar</b-button>
        </div>
      </div>
    </div>

    <p class="title is-5 theme-text">ANIME</p>
    <div class="columns">
      <div class="column">
        <p class="subtitle is-6 theme-text">Anime Provider</p>
        <div class="buttons">
            <b-button type="is-dark" expanded outlined>Twist.Moe</b-button>
            <b-button type="is-dark" expanded outlined>9Anime</b-button>
        </div>
      </div>
      <div class="column">
        <p class="subtitle is-6 theme-text">Sync With MAL</p>
        <b-field type="is-dark">
            <b-input placeholder="Username"
                type="search"
                icon="user-ninja">
            </b-input>
        </b-field>
        <b-field type="is-dark">
            <b-input placeholder="Password"
                type="password"
                icon="pepper-hot"
                password-reveal>
            </b-input>
        </b-field>
      </div>
    </div>
  </div>
</template>

<script>
import { Chrome } from 'vue-color'
import '../../node_modules/@fortawesome/fontawesome-free/js/all.js';

export default {
  name: "Options",
  components: {
    'chrome-picker': Chrome,
  },
  data() {
    return {
      accentColor: this.$store.getters.accentCol
    };
  },
  methods: {
    changeTheme(theme) {
      this.$store.commit('changeTheme', theme);
    }
  },
  watch: {
    accentColor(to) {
      this.$store.commit("changeAccent", to.hex);
    }
  }
};
</script>

<style>
.columns { overflow: hidden; }
.title, .subtitle { margin-bottom: 5px !important; }

.vc-chrome-toggle-btn { overflow: hidden; }
.vc-chrome { box-shadow: 0px 0px 10px -5px var(--accent) !important; }
.vc-chrome-body { background: var(--themeBg) !important; }

.indent { 
  padding: 10px;
  overflow-x: hidden !important;
}

#main .button {
  color: var(--textCol) !important;
}

#main .button.active {
  background: var(--accent);
  border: none;
  color: var(--accentText) !important;
}

#main .button:hover {
  color: white !important;
}

#main .button.active:hover {
  color: var(--accentText) !important;
}
</style>