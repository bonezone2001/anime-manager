<template>
  <div id="app" :style="styleObject">
    <header id="window-bar">
      <div id="resize-top-fix"/>
      <div id="resize-top-left-fix"/>
      <div id="window-title">
        <span ref="title"></span>
      </div>
      <div id="window-controls">
        <div @click="controls($event)" id="min"><span>&#xE921;</span></div>
        <div @click="controls($event)" id="max"><span>&#xE922;</span></div>
        <div @click="controls($event)" id="restore"><span>&#xE923;</span></div>
        <div @click="controls($event)" id="close"><span>&#xE8BB;</span></div>
      </div>
    </header>
    <Sidebar/>
    <transition :duration="100" name="fast" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import { remote } from "electron";                // Import remote so we can 'remote'ly access mainwindow
import Sidebar from "@/components/Sidebar.vue";   // Import sidebar component
import Themes from "@/themes.js";

function dynamicScrollbarWorkaround(col) {
  var link = document.createElement("style");
  link.type = "text/css";
  link.id = "custom-scroll";
  link.innerHTML = `::-webkit-scrollbar-thumb {background: ${col};}`;

  var curID = document.getElementById('custom-scroll');
  if(curID == undefined)
    document.head.append(link);
  else
    curID.innerHTML = link.innerHTML;
}

// Convert hex colour to HS lightness
function hexToLightness(H) {
  // Convert to RGB
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }

  // Convert to lightness
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b);
  let l = (cmax + cmin) / 2;
  l = +(l * 100).toFixed(1);

  return l;
}

export default {
  name: "App",
  components: {
    Sidebar
  },
  // Setup theme CSS variables
  computed: {
    styleObject: function() {
      let accentCol = this.$store.getters.accentCol;
      let themeData = Themes.getTheme(this.$store.getters.theme);

      // Set application & scrollbar bg
      document.body.style = `background: ${themeData.background};`;   // Set body bg manually, CSS variables are scoped to #app and lower
      dynamicScrollbarWorkaround(accentCol);                          // Same deal, we don't have scope of thumb color so we have to do it this way

      // Set CSS variables
      return {
        '--themeBg': themeData.background,
        '--textCol': themeData.text,
        '--accent': accentCol,
        '--accentText': hexToLightness(accentCol) > 70 ? '#000' : '#fff'
      }
    }
  },
  methods: {
    // Handle the windows control buttons
    // This could have probably been done in a better way. However, I am lazy and we are doing it this way.
    controls(event) {
      const win = remote.getCurrentWindow();  // Get instance of main window
      switch (event.currentTarget.id) {
        case "min":
          win.minimize();
          break;
        case "max":
          win.maximize();
          break;
        case "restore":
          win.restore();
          break;
        default:
          win.close();
          break;
      }
    }
  },
  created() {
    // Get instance of main window, create event handler for max/restore that applies the 'maximized' class to document body
    const win = remote.getCurrentWindow();
    function toggleMaxRestoreButtons() { (win.isMaximized() ? document.body.classList.add('maximized') : document.body.classList.remove('maximized')); }
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);
  },
  mounted() {
    // Start at / if not already, compiled versions start in exec directory for some reason
    if(this.$router.currentRoute.path != "/")
      this.$router.push({ path: '/' });

    // Title animation
    this.$refs.title.innerHTML = this.$store.getters.isCollapsed ? "Zulkia" : "Zulkia Anime Manager";
    this.$store.watch((state, getters) => getters.isCollapsed, (newValue) => {
      let isDeleting = newValue; // Store current collapsed state
      
      // Animation interval
      var interval = setInterval(() => {
        // If title doesn't exist (just in case) or state changed (reverse animation)
        if(this.$refs.title == undefined || isDeleting != this.$store.getters.isCollapsed) {
          clearInterval(interval);
          return;
        }

        // Current title's text
        let curText = this.$refs.title.innerHTML;

        // If the text is the appropriate size for current state (animation finished)
        if((isDeleting && curText.length == 6) || (!isDeleting && curText.length == 20)) {
          clearInterval(interval);
          return;
        }

        // Delete text
        if(isDeleting)
          this.$refs.title.innerHTML = curText.substring(0, curText.length - 1);
        // Add text
        else {
          var fullText = "Zulkia Anime Manager";
          this.$refs.title.innerHTML = curText + fullText[curText.length];
        }
      }, 25);
    });
  }
}
</script>

<style>

/* General window */
* { margin: 0; border: 0; outline: none; vertical-align: baseline; overflow-y: auto !important;}
*, *:before, *:after {box-sizing: inherit; outline:none; }
html { height: 100%; box-sizing: border-box; background: transparent !important; }
body { user-select: none; overflow-y: auto; }

#app {
  height: 100%;
  padding-top: 32px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  overflow-y: auto;
}

/* Global Scrollbar */
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: transparent; }

/* Other shit */
.input, .input::-webkit-input-placeholder, .taginput .taginput-container.is-focusable::-webkit-input-placeholder, .textarea::-webkit-input-placeholder, .select select::-webkit-input-placeholder {
  color: var(--textCol) !important;
  background: transparent !important;
}
.input:focus, .taginput .taginput-container.is-focusable:focus, .textarea:focus, .select select:focus, .is-focused.input, .taginput .is-focused.taginput-container.is-focusable, .is-focused.textarea, .select select.is-focused, .input:active, .taginput .taginput-container.is-focusable:active, .textarea:active, .select select:active, .is-active.input, .taginput .is-active.taginput-container.is-focusable, .is-active.textarea, .select select.is-active {
  border-color: var(--accent) !important;
}

.icon, .icon.has-text-primary { color: var(--textCol) !important; }
.select select { cursor: default !important; }

/*** Window bar/controls ***/
/* Main bar */
#window-bar {
  -webkit-app-region: drag;
  color: var(--textCol);
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

/* Title for the window div */
#window-bar #window-title {
  grid-column: 1;
  display: flex;
  overflow-x: hidden;
  font-family: "Segoe UI", sans-serif;
  font-size: 12px;
  line-height: 1.8em;
}

/* Title text styling */
#window-bar #window-title span {
  margin-left: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
}

/* Fixes dragging top of application (caused by app-region: drag) */
#resize-top-fix {
  -webkit-app-region: no-drag;
  width: 100%;
  height: 5px;
  position: absolute;
}

#resize-top-left-fix {
  -webkit-app-region: no-drag;
  width: 5px;
  height: 100%;
  position: absolute;
}

/* Control button div positioning and general style */
#window-controls {
  -webkit-app-region: no-drag;
  grid-template-columns: repeat(3, 46px);
  display: grid;
  position: absolute;
  background: var(--themeBg);
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
#window-controls #close:hover { background: #E81123 !important; }
#window-controls #close:active { background: #a81123 !important; }

/* Setup all the buttons grid and visibility */
#window-controls #min { grid-column: 1; }
#window-controls #max, #window-controls #restore { grid-column: 2; }
#window-controls #close { grid-column: 3; }
#window-controls #restore { display: none !important; }

/* Swap restore and max buttons when maximized */
.maximized #window-bar #restore { display: flex !important; }
.maximized #window-bar #max { display: none; }

.theme-text { color: var(--textCol) !important; }
.theme-bg { background: var(--themeBg) !important; }

/* Main */
#main {
  transition: .5s;
  width: calc(100% - 272px);
  height: 100%;
  margin-left: 272px;
  overflow: auto;
}

#main.collapsed {
  margin-left: 52px;
  width: calc(100% - 54px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter,
.fade-leave-to,
.fast-enter,
.fast-leave-to {
  opacity: 0;
}

</style>