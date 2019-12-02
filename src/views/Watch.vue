<template>
  <div class="main" :class="{'collapsed' : this.$store.getters.isCollapsed}" id="home">
    <span hidden>{{animeUpdate}}</span>
    <transition-group appear name="fade">
      <img
        class="anime-img"
        :class="{'extend' : $store.getters.isCollapsed}"
        v-for="(obj, idx) in anime"
        :key="idx"
        :index="idx"
        :src="obj.path"
        @click.right="handleAnime($event, true)"
        @click="handleAnime($event)"
        @mouseover="handleAnimeHover($event)"
      />
    </transition-group>
  </div>
</template>

<script>
import path from "path";                    // Import path so we can append directories together
import { remote } from "electron";          // Import remote so we can 'remote'ly access mainwindow
const fs = require("fs");                   // Import fs so we can use the file system
const opn = require("opn");                 // Import opn so we can open links in the default browser across different os
const clipboardy = require("clipboardy");   // Import clipboardy so we can manipulate the clipboard across different os
import Fuse from "fuse.js";                 // Import fuse.js so we can 'fuzzy' search through arrays (approximate search)
import { mkdirSync } from "fs";             // Import mkdirSync for making directories syncronously
import sanitize from 'sanitize-filename';   // Used for sanatising strings so we can use them in path names

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
      anime: [] // All anime currently being displayed
    };
  },
  props: {
    isWatched: Boolean // param passed so determine if the current watch component is watch or watched (determines the list to load)
  },
  methods: {
    // Function that loads the anime
    loadAnime() {
      this.$store.commit('changeHovered', {}); // Reset the current hovered obj
      let rawdata = fs.readFileSync(this.appPath + (this.$props.isWatched ? "watched.json" : "watch.json")); // Read the file.. duhhhh
      let watchList = JSON.parse(rawdata); // Parse the json so we get an array of objects

      // Load the shared file (shared file is used to store descriptions, scores, rating, etc. Stuff that isn't specific to either watched or watch)
      rawdata = fs.readFileSync(this.appPath + "shared.json");
      let animeData = JSON.parse(rawdata);

      // Get all the file paths in images directory
      fs.readdir(this.imgPath, (err, items) => {
        this.anime = []; // Reset the current anime loaded
        watchList.forEach((animeObj) => { // Itterate through the anime list we loaded
          let curAnimeData = {}; // Store info about the current anime
          // Loop through all the shared data and match the shared data to the anime
          // We cannot break out of for loops so this is a little unoptimised but so is
          // The rest of this program
          animeData.forEach((data) => {
            if(data.name == animeObj.name) {
              curAnimeData = data;
            }
          });
          // Loop through all the paths and find the image associated with anime
          items.forEach((filePath) =>{
            // get file name from path
            let filename = filePath.replace(/^.*[\\\/]/, "");
            let animeName = filename.substring(0, filename.length - 4);
            // Compare path anime name with anime name sanatised
            if(animeName == sanitize(animeObj.name))
              this.anime.push({ path: this.imgPath + filePath, ...curAnimeData }); // Push anime with img path and merge curAnimeData obj with this one
          });
        })
        // Store all the anime currently loaded globally so we can use them in things (mainly AddRemoveAnime component)
        this.$store.commit('changeLoaded', this.anime)
      });
    },
    // Handle the user clicking the anime (copy arg is true when right clicked, used to copy anime name instead of opening it)
    handleAnime(event, copy = false) {
      // Get index relative to the this.anime array that we stored within the html as an attribute
      const index = event.currentTarget.getAttribute("index");
      if (index == undefined) return;

      // Get anime from index, get name from path
      let animeObj = this.anime[parseInt(index)];
      let fullPath = animeObj.path;
      let filename = fullPath.replace(/^.*[\\\/]/, "");
      let anime = filename.substring(0, filename.length - 4);

      // Open anime if not copy == true, copy if not copy == false
      if (!copy) {
        // Search through the anime we scraped from twistMoe
        var fuse = new Fuse(this.$store.getters.twistMoe, options);
        var result = fuse.search(anime);
        // Open anime
        opn(result[0].link);
      } else clipboardy.write(anime); // Overwrite clipboard
    },
    // Handle anime hover (the way in which the extra data is displayed is going to be changed)
    // So this is just temporary
    handleAnimeHover(event) {
      const index = event.currentTarget.getAttribute("index");
      let animeObj = this.anime[parseInt(index)];
      this.$store.commit('changeHovered', animeObj)
    },
    // Check if the files exist, if they don't, create them
    checkFiles() {
      if (!fs.existsSync(this.appPath)) mkdirSync(this.appPath);
      if (!fs.existsSync(this.imgPath)) mkdirSync(this.imgPath);

      const files = [
        this.appPath + "shared.json",
        this.appPath + "watched.json",
        this.appPath + "watch.json"
      ];
      files.forEach(file => {
        if (!fs.existsSync(file)) {
          fs.writeFile(file, "[]", err => {
            if (err) throw err;
          });
        }
      });
    }
  },
  computed: {
    animeUpdate() {
      if(this.$store.getters.newAnime == false)
        return;
      this.loadAnime();
      const a = this.$store.getters.newAnime; // We have to use this here so Vue runs this function when .newAnime changes
      this.$store.commit('changeAnime', false);
      return "";
    }
  },
  created() {
    // Load files into array from path
    this.checkFiles();
    this.loadAnime();
  },
  destroyed() {
      this.$store.commit('changeHovered', {});
  },
  watch: {
    $route(to, from) {
      // Load files into array from path
      this.checkFiles();
      this.loadAnime();
    }
  }
};
</script>

<style scoped>
.anime-img {
  transition: 0.5s;
  float: left;
  width: 200px;
  height: 300px;
  margin: 0 2px 2px 0;
}

.extend {
  width: 243.5px;
  height: 343.5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>