import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isCollapsed: false,
    newAnime: false,
    toDownload: [],
    downloadState: 'idle',
    downloadInterval: null,
    twistMoe: [],
    loadedAnime: [],
    currentHovered: {}
  },
  mutations: {
    changeCollapse(state, val) {
      state.isCollapsed = val
    },
    changeAnime(state, val) {
      state.newAnime = val
    },
    addDownload(state, val) {
      state.toDownload.push(val);
    },
    shiftDownload(state) {
      state.toDownload.shift();
    },
    changeDownloadState(state, val) {
      state.downloadState = val
    },
    changeInterval(state, val) {
      state.downloadInterval = val
    },
    changeLoaded(state, val) {
      state.loadedAnime = val
    },
    changeHovered(state, val) {
      state.currentHovered = val
    },
    changeTwistMoe(state, val) {
      state.twistMoe = val
    }
  },
  getters: {
    isCollapsed: state => state.isCollapsed,
    newAnime: state => state.newAnime,
    toDownload: state => state.toDownload,
    downloadState: state => state.downloadState,
    downloadInterval: state => state.downloadInterval,
    loadedAnime: state => state.loadedAnime,
    currentHovered: state => state.currentHovered,
    twistMoe: state => state.twistMoe,
  },
  actions: {},
  modules: {}
});