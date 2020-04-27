<template>
  <div id="main" :class="!this.$store.getters.isCollapsed || 'collapsed'">
    <span hidden>{{animeUpdate}}</span>
    <div id="watchbuttons">
      <div @click="randomAnime($event)" @click.right="randomAnime($event)">⇋</div>
      <input v-model="search" placeholder="Search">
    </div>
    <transition-group appear name="fade">
      <div class="anime"
        :class="{'extend' : $store.getters.isCollapsed}"
        v-for="(obj, i) in anime"
        :style="{ 'background-image': `url('${getImage(obj.path)}')` }"
        :key="i+1"
        :idx="i"
        @click="handleAnime($event)"
        @click.right="handleAnime($event)"
        @mouseenter="handleAnimeHover($event)"
        @mouseleave="handleAnimeHover($event)"/>
    </transition-group>
  </div>
</template>

<script>
import fs from 'fs';                      // Import fs so we can use the file system
import opn from 'opn';                    // Import opn so we can open links in the default browser across different os
import path from 'path';                  // Import path so we can append directories together
import Fuse from "fuse.js";               // Import fuse.js so we can 'fuzzy' search through arrays (approximate search)
import { remote } from 'electron';        // Import remote so we can 'remote'ly access mainwindow
import copy from 'copy-to-clipboard';     // Import library to add overwrite clipbard
import sanitize from 'sanitize-filename'; // Used for sanatising strings so we can use them in path names
import starRating from 'vue-star-rating'; // Create star ratings for anime based on score 0/10

// Options for fuse.js (fuzzy search)
const options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 300,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["name"]
};

export default {
  name: "Watch",
  data() {
    return {
      appPath: path.join(remote.app.getPath("userData"), "/Core/"),         // Main path
      imgPath: path.join(remote.app.getPath("userData"), "/Core/Images/"),  // Images path
      anime: [],
      search: ""
    };
  },
  components: {
    starRating
  },
  props: {
    isWatched: Boolean // Param to determine which list to load
  },
  computed: {
    animeUpdate() {
      this.$store.getters.hasAddedAnime;
      if(this.$store.getters.hasAddedAnime == false)
          return;
      this.loadAnime();
      this.$store.commit("changeAdded", false);
    }
  },
  methods: {
    initialize() {
      this.checkFiles();
      this.loadAnime();
    },

    // Used to convert escape backslashes
    getImage(aPath) {
      return aPath.replace(/\\/g, "/");
    },

    // Load all anime in watch/watched json files
    loadAnime() {
      // Read watch/watched and parse JSON
      let rawdata = fs.readFileSync(this.appPath + (this.$props.isWatched ? "watched.json" : "watch.json"));
      let watchList = JSON.parse(rawdata);

      // Load the shared file and parse JSON (shared file contains descriptions, scores, rating, etc. Anything that isn't specific to watch/watched)
      rawdata = fs.readFileSync(this.appPath + "shared.json");
      let animeData = JSON.parse(rawdata);

      // Gather all paths in image directory
      fs.readdir(this.imgPath, (err, items) => {
        this.anime = []; // Reset the current anime loaded
        
        // Itterate through the anime list we loaded
        watchList.forEach((curAnime) => {
          let curAnimeData = {}; // Store current anime's info

          // Itterate shared data, pair with anime
          animeData.some((shared) => {
            return !(shared.name != curAnime.name || (curAnimeData = shared) == undefined)
          });

          // Loop through all the paths and find the image associated with anime
          items.forEach((filePath) =>{
            // Get file name from path
            let filename = filePath.replace(/^.*[\\\/]/, "");
            let animeName = filename.substring(0, filename.length - 4);
            
            // Compare path anime name with anime name sanatised
            if(animeName == sanitize(curAnime.name))
              this.anime.push({ path: this.imgPath + filePath, ...curAnimeData }); // Push anime with img path and merge curAnimeData obj with this one
          });
        })
        // Store all the anime currently loaded globally so we can use them in things (mainly AddRemoveAnime component)
        this.$loadedAnime = this.anime;
      });
    },

    // Handle the user clicking the anime (Right click, used to copy anime name instead of opening it)
    handleAnime(event) {
      // Get index relative to the this.anime array that we stored within the html as an attribute
      const idx = event.currentTarget.getAttribute("idx");
      if (idx == undefined) return;

      // Get anime from index, get name from path
      let animeObj = this.anime[parseInt(idx)];
      let fullPath = animeObj.path;
      let filename = fullPath.replace(/^.*[\\\/]/, "");
      let anime = filename.substring(0, filename.length - 4);

      // Open anime if left click, copy if right click (not left click)
      if (event.button == 0) {
        var search = this.$site.search(anime); // Search for anime
        opn(search[0].link);                    // Open anime link retrieve
      } else copy(anime); // Overwrite clipboard
    },

    // TODO: anime hovering
    handleAnimeHover(event) {
      const el = event.currentTarget;
      const index = el.getAttribute("idx");
      const animeObj = this.anime[parseInt(index)];
      
      if(event.type == "mouseenter") {
        // Create overlay
        // synopsis: info.synopsis,
        // genres: genreShort,
        el.style = `color: white; text-align: center; background:linear-gradient( rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.4)100%), url('${this.getImage(animeObj.path)}');`
        el.innerHTML = `\
        <p id="anime-title">${animeObj.name.charAt(0).toUpperCase() + animeObj.name.substring(1)}</p>\
        <p id="anime-length">${animeObj.duration}</p>\
        <p id="anime-episodes">${animeObj.episodes}</p>\
        <p id="anime-airing">${animeObj.airing}</p>\
        <p id="anime-score">${animeObj.score}</p>\
        `;
      } else {
        // Remove overlay
        el.style = `background-image: url('${this.getImage(animeObj.path)}'`
        el.innerHTML = "";
      }
    },

    // Select random anime from current list (Right click, from anime site)
    randomAnime(event) {
      if(event.button == 0) { // From list (super lazy way)
        let animeImgs = document.querySelectorAll(".anime-img");
        if(animeImgs.length == 0) return;
        var obj = animeImgs[Math.floor(Math.random() * animeImgs.length)];
        obj.click();
      } else { // Any from anime site
        let anime = this.$site.random();
        opn(anime.link);
      }
    },

    // Check folders/files and create missing
    checkFiles() {
      // Folders and files
      const data = [
        this.appPath, this.imgPath,
        this.appPath + "shared.json",
        this.appPath + "watched.json",
        this.appPath + "watch.json"
      ];

      data.forEach(file => {
        if(!fs.existsSync(file)) {
          if(file.split('.').pop() != "json")
            fs.mkdirSync(file);
          else
            fs.writeFileSync(file, "[]");
        }
      });
    }
  },

  mounted() {
    this.initialize();
  },
  watch: {
    // Replicate mounted()
    $route() {
      this.initialize();
    },

    search(to) {
      // Reset list when empty
      if(to.length < 1)
        this.loadAnime();
      // Attempt search
      var fuse = new Fuse(this.$loadedAnime, options);
      var result = fuse.search(to);
      this.anime = result;
    }
  }
};
</script>

<style>
#watchbuttons {
  -webkit-app-region: no-drag;
  color: var(--textCol);
  height: 32px;
  width: auto;
  position: absolute;   /* add option to set to fixed (in settings) */
  background: var(--themeBg);
  margin-top: -32px;
}

#watchbuttons div {
  float: left;
  width: 40px;
  height: 100%;
  text-align: center;
  line-height: 32px;
  align-items: center;
}

#watchbuttons input {
  background: transparent;
  color: var(--textCol);
  padding: 0 5px;
  width: 150px;
  height:32px;
}

/* Setup all the buttons hover/active colouring */
#watchbuttons div:hover { background: rgba(55,55,55,0.5); }
#watchbuttons div:active { background: rgba(55,55,55,0.5); }
#watchbuttons input:hover { background: rgba(55,55,55,0.5); }

.anime {
  transition: 0.5s;
  float: left;
  width: 200px;
  height: 300px;
  margin: 0 2px 2px 0;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

.extend {
  width: 243.6px;
  height: 360px;
}

#anime-title {
  color: red
}

#anime-length {
}

#anime-episodes {
}

#anime-airing {
}

#anime-score {
}
</style>