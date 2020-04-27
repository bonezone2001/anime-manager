<template>
  <form :style="styleObject">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ this.isWatched ? "Watched" : "Watch "}} List</p>
      </header>
      <section class="modal-card-body">
        <div class="divide is-pulled-left">
          <b-field label="Name">
            <b-input ref="anime" type="text" :value="anime" v-model="anime" placeholder="Anime"></b-input>
          </b-field>
          <b-field label="Comment">
            <b-input type="text" :value="comment" v-model="comment" placeholder="Comments"></b-input>
          </b-field>
          <div class="field is-grouped is-grouped-right">
            <button tabindex="999" class="button" type="button" @click="$parent.close()">Close</button>
            <button class="button main-btn" @click.prevent="addAnime()">Add</button>
          </div>
        </div>
        <div v-if="this.loadedAnime.length > 0">
          <b-field>
            <b-select expanded multiple v-model="selectedOptions">
              <option
                v-for="(anime, idx) in this.loadedAnime"
                :key="idx"
                :value="idx"
              >{{ anime.name }}</option>
            </b-select>
          </b-field>
          <div class="field is-grouped is-grouped-right">
            <button class="button main-btn wo-margin" @click.prevent="removeAnime()">Remove</button>
            <button class="button main-btn" @click.prevent="switchAnime()">Switch</button>
          </div>
        </div>
      </section>
    </div>
  </form>
</template>

<script>
import path from "path";
import { remote } from "electron";
import fs from "fs";
import { stringify } from 'querystring';

const request = require("request");
const Jikan = require('jikan-node');
const sanitize = require("sanitize-filename");

var download = function(uri, filename, callback) {
  request(uri)
      .pipe(fs.createWriteStream(filename))
      .on("close", callback);
};

export default {
  name: "AddAnime",
  data() {
    return {
      anime: "",
      comment: "",
      loadedAnime: [],
      selectedOptions: [],
      currentPath:
        path.join(remote.app.getPath("userData"), "/Core/") +
        (this.$props.isWatched ? "watched.json" : "watch.json"),
      oppositePath:
        path.join(remote.app.getPath("userData"), "/Core/") +
        (!this.$props.isWatched ? "watched.json" : "watch.json")
    };
  },
  computed: {
    // Setup theme CSS variables (again)
    // (because the ones defined in App lose scope - probably because component is created by buefy)
    styleObject: function() {
      return {
        "--accent": this.$store.getters.accentCol
      };
    }
  },
  props: {
    isWatched: Boolean
  },
  methods: {
    loadList(isOther = false) {
      let rawdata = fs.readFileSync( isOther ? this.oppositePath : this.currentPath );
      let newList = JSON.parse(rawdata);
      return newList;
    },

    addAnimeFile(animeOptions, store, pathAtTime) {
      let curList = this.loadList();
      curList.push({ name: animeOptions.name.toLowerCase(), comment: animeOptions.comment });
      fs.writeFileSync(pathAtTime, JSON.stringify(curList, null, 2));
      this.loadedAnime = curList;
      store.commit("changeAdded", true);
    },

    async addDataFile(animeOptions) {
      const sharedFile = path.join(remote.app.getPath("userData"), "/Core/shared.json");
      let rawdata = fs.readFileSync(sharedFile);
      let otherData = JSON.parse(rawdata);
      otherData.push(animeOptions);
      fs.writeFileSync(sharedFile, JSON.stringify(otherData, null, 2));
    },

    animeDownloadInterval(imgPath) {
      if(this.$downloadQueue.length == 0) {
        clearInterval(this.$downloadInterval);
        this.$downloadInterval = null;
        return;
      }

      const mal = new Jikan();
      const animeQ = this.$downloadQueue[0];
      this.$downloadQueue.shift();

      // Switched to using Jikan, its easier than scraping the data
      // My old method is more accurate () but Jikan is more powerful and... I'm lazy
      try {
        // Get/find anime page (mal_id)
        mal.search('anime', animeQ.name, {page: 1, order_by: 'title'}).then(search => {
          if (search.results == undefined || search.results.length == 0) {
            remote.dialog.showErrorBox("", "Anime search failed");
            return;
          }

          // Get anime information
          const animeObj = search.results[0];
          mal.findAnime(animeObj.mal_id.toString(), '').then(info => {

            // Get genres from data
            var genreShort = [];
            info.genres.forEach(genre => {
              genreShort.push(genre.name);
            });
            
            // Add shared data to file
            this.addDataFile({
              duration: info.duration,
              episodes: info.episodes,
              synopsis: info.synopsis,
              airing: info.airing,
              genres: genreShort,
              name: animeQ.name.toLowerCase(),
              score: info.score,
              rank: info.rank
            });

            // Download anime image and add anime to watch list
            const instance = this;
            const store = this.$store;
            download(
              encodeURI(info.image_url),
              imgPath + sanitize(animeQ.name) + ".jpg",
              function() {
                console.log(`downloaded ${animeQ.name}`);
                instance.addAnimeFile(animeQ, store, animeQ.pathAtTime);
              }
            );
          });
        });
      } catch (err) {
        console.log(`Anime search error: ${err}`);
      }
    },

    addAnime() {
      if (this.anime == "") {
        remote.dialog.showErrorBox("", "Enter anime first :o");
        return;
      }
      const store = this.$store;
      const imgPath = path.join(remote.app.getPath("userData"), "/Core/Images/");

      // Check if image exist, if not download, else add to list
      if (!fs.existsSync(imgPath + sanitize(this.anime) + ".jpg")) {
        // Add to list of downloads
        this.$downloadQueue.push({name: this.anime, comment: this.comment, pathAtTime: this.currentPath });
        // Start downloader if not already started, will kill itself
        if(this.$downloadInterval == null)
          this.$downloadInterval = setInterval(this.animeDownloadInterval.bind(null,imgPath), 2500);
      } else
        this.addAnimeFile({name: this.anime, comment: this.comment}, store, this.currentPath);
    },

    removeAnime() {
      let newList = this.loadList();
      this.selectedOptions.reverse().forEach(idx => {
        newList.splice(idx, 1);
      });
      fs.writeFileSync(this.currentPath, JSON.stringify(newList, null, 2));
      this.loadedAnime = newList;
      this.$store.commit("changeAdded", true);
    },

    switchAnime() {
      let newList = this.loadList();
      let newListOther = this.loadList(true);
      this.selectedOptions.reverse().forEach(idx => {
        const obj = newList[idx];
        newList.splice(idx, 1);
        newListOther.push(obj);
      });
      fs.writeFileSync(this.currentPath, JSON.stringify(newList, null, 2));
      fs.writeFileSync(this.oppositePath, JSON.stringify(newListOther, null, 2));
      this.loadedAnime = newList;
      this.$store.commit("changeAdded", true);
    }
  },
  
  mounted() {
    this.$refs.anime.focus();
    this.loadedAnime = this.loadList();
  }
};
</script>

<style scoped>
.modal-card {
  width: auto;
}
.modal-card-title {
  padding: 0 0 5px 0;
}
.modal-card-head {
  text-align: center;
  padding: 15px;
  border-radius: 0;
}
.modal-card-body {
  color: black;
  padding: 10px;
}
.main-btn {
  color: white;
  background: var(--accent);
  border: 0;
  margin-left: 5px;
}
.divide {margin-right: 2px; padding-right: 2px}
</style>