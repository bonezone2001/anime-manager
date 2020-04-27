import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isCollapsed: false,
    animeAdded: false,
    accentColour: "#ca4c1a",
    theme: "dark"
  },
  mutations: {
    changeCollapse(state, val) { state.isCollapsed = val },
    changeAdded(state, val) { state.animeAdded = val },
    changeAccent(state, val) { state.accentColour = val },
    changeTheme(state, val) { state.theme = val }
  },
  getters: {
    isCollapsed: state => state.isCollapsed,
    hasAddedAnime: state => state.animeAdded,
    accentCol: state => state.accentColour,
    theme: state => state.theme
  },
  actions: {},
  modules: {}
})
