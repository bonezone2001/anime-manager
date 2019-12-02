<!-- HTML Template -->
<template>
  <div id="app">
    <header id="window-bar">
      <div class="window-title">
        <span>{{ this.$store.getters.isCollapsed ?  "Zulkia" : "Zulkia Anime Manager"}}</span>
      </div>
      <div id="window-controls">
        <div @click="controls($event)" id="min-button"><span>&#xE921;</span></div>
        <div @click="controls($event)" id="max-button"><span>&#xE922;</span></div>
        <div @click="controls($event)" id="restore-button"><span>&#xE923;</span></div>
        <div @click="controls($event)" id="close-button"><span>&#xE8BB;</span></div>
      </div>
    </header>
    <Sidebar/>
    <router-view />
  </div>
</template>

<!-- Logic -->
<script>
import { remote } from "electron";                // Import remote so we can 'remote'ly access mainwindow
import Sidebar from "@/components/Sidebar.vue";   // Import sidebar component
import { parse } from 'node-html-parser';         // Import html parser
const cloudscraper = require('cloudscraper');     // Import cloudflare scrape bypass

export default {
  name: "app",
  components: {
    Sidebar
  },
  methods: {
    // Function that handles the window control buttons
    controls: (event) => {
      const win = remote.getCurrentWindow();
      // This could have probably been done in a better way, probably within the actual HTML
      // However, I am lazy and we are doing it this way.
      switch (event.currentTarget.id) {
        case "min-button":
          win.minimize();
          break;
        case "max-button":
          win.maximize();
          break;
        case "restore-button":
          win.restore();
          break;
        default:
          win.close();
          break;
      }
    }
  },
  created() {
    // Setup window to switch max/restore buttons when state change
    const win = remote.getCurrentWindow();
    function toggleMaxRestoreButtons() { (win.isMaximized() ? document.body.classList.add('maximized') : document.body.classList.remove('maximized')); }
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    // Scrape twist.moe since they keep all the anime in the HTML for fast searching
    cloudscraper('https://twist.moe').then((htmlStr) =>{
      const html = parse(htmlStr); // Scrape html
      const animeItems = html.querySelectorAll('nav.series li'); // Find anime containers
      let animes = []; // Store all the anime we find
      animeItems.forEach(anime => { // loop through all the anime so we can extra specific data
        animes.push({ // Add anime to list with...
          name: anime.querySelector('span').innerHTML.trim(), // Extracted name
          link: "https://twist.moe" + anime.querySelector('a').attributes.href // Extracted anime link
        });
      });
      // This is the method i use to update state in watch/watched pages from other components or even within itself
      this.$store.commit('changeTwistMoe', animes);
    }).catch((err) =>{ console.log(err) });
  }
};
</script>

<!-- Style -->
<style>

/* General window */
* { margin: 0; padding: 0; border: 0; color: white; vertical-align: baseline; overflow-y: auto !important;}
*, *:before, *:after {box-sizing: inherit; outline:none; }
html {box-sizing: border-box; background: transparent !important; }

body {
  user-select: none;
  background: #151515;
  overflow-y: auto;
}

#app {
  height: calc(100% - 32px);
  margin-top: 32px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #2c3e50;
  overflow-y: auto;
}

/* Global Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-thumb {
  background: #CA4C1A6f;
}

::-webkit-scrollbar-track {
  background: transparent;
}

/*** Window bar/controls ***/
/* Main bar */
#window-bar {
  -webkit-app-region: drag;
  display: grid;
  position: fixed;
  width: 100%;
  height: 32px;
  top: 0;
  left: 0;
  padding: 4px;
  grid-template-columns: auto 138px;
  user-select: none;
}

#window-controls {
  background: #151515;
}

/* Title for the window div */
.window-title {
  grid-column: 1;
  display: flex;
  overflow-x: hidden;
  font-family: "Segoe UI", sans-serif;
  font-size: 12px;
  line-height: 1.8em;
}

/* Title text styling */
.window-title span {
  margin-left: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
}

/* Control button div positioning and general style */
#window-controls {
  -webkit-app-region: no-drag;
  grid-template-columns: repeat(3, 46px);
  display: grid;
  position: absolute;
  height: 100%;
  top: 0;
  right: 0;
  font-family: "Segoe MDL2 Assets";
  font-size: 10px;
}

/* Control buttons */
#window-controls div {
  grid-row: 1 / span 1;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

/* Setup all the buttons hover/active colouring */
#window-controls div:hover { background: rgba(255,255,255,0.1); }
#window-controls div:active { background: rgba(255,255,255,0.2); }
#close-button:hover { background: #E81123 !important; }
#close-button:active { background: #a81123 !important; }

/* Setup all the buttons grid and visibility */
#min-button { grid-column: 1; }
#max-button, #restore-button { grid-column: 2; }
#close-button { grid-column: 3; }
#restore-button { display: none !important; }

/* Swap restore and max buttons when maximized */
.maximized #restore-button { display: flex !important; }
.maximized #max-button { display: none; }

/* Main */
.main {
  transition: .5s;
  width: calc(100% - 272px);
  height: 100%;
  margin-left: 272px;
  overflow: auto;
}

.main.collapsed {
  margin-left: 52px;
  width: calc(100% - 54px);
}

.input:focus, .taginput .taginput-container.is-focusable:focus, .textarea:focus, .select select:focus, .is-focused.input, .taginput .is-focused.taginput-container.is-focusable, .is-focused.textarea, .select select.is-focused, .input:active, .taginput .taginput-container.is-focusable:active, .textarea:active, .select select:active, .is-active.input, .taginput .is-active.taginput-container.is-focusable, .is-active.textarea, .select select.is-active {
  border-color: #ca4c1a !important;
  box-shadow: 0 0 0 0.125em rgba(202, 76, 26, 0.25);
}
.select select {
  cursor: default !important;
}
</style>
