<template>
  <form>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ this.isWatched ? "Watched" : "Watch "}} List</p>
      </header>
      <section class="modal-card-body">
        <div class="has-divider is-pulled-left">
          <b-field label="Name" custom-class="has-text-white">
            <b-input ref="anime" type="text" :value="anime" v-model="anime" placeholder="Anime"></b-input>
          </b-field>
          <b-field label="Comment" custom-class="has-text-white">
            <b-input type="text" :value="comment" v-model="comment" placeholder="Comments"></b-input>
          </b-field>
          <div class="field is-grouped is-grouped-right">
            <button tabindex="999" class="button" type="button" @click="$parent.close()">Close</button>
            <button class="button main-btn" @click.prevent="addAnime()">Add</button>
          </div>
        </div>
        <b-field>
          <b-select expanded multiple v-model="selectedOptions">
            <option
              v-for="(anime, idx) in $store.getters.loadedAnime"
              :key="idx"
              :value="idx"
            >{{ anime.name }}</option>
          </b-select>
        </b-field>
        <div class="field is-grouped is-grouped-right">
          <button class="button main-btn wo-margin" @click.prevent="removeAnime()">Remove</button>
          <button class="button main-btn" @click.prevent="switchAnime()">Switch</button>
        </div>
      </section>
    </div>
  </form>
</template>

<script>
import path from "path";
import { remote } from "electron";
const fs = require("fs");
import { parse } from "node-html-parser";
const request = require("request");
const cloudscraper = require("cloudscraper");
const sanitize = require("sanitize-filename");

var download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on("close", callback);
  });
};

export default {
  name: "AddAnime",
  data() {
    return {
      anime: "",
      comment: "",
      selectedOptions: [],
      watchPath: path.join(remote.app.getPath("userData"), "/Core/") + (this.$props.isWatched ? "watched.json" : "watch.json"),
      oppositePath: path.join(remote.app.getPath("userData"), "/Core/") + (!this.$props.isWatched ? "watched.json" : "watch.json")
    };
  },
  props: {
    isWatched: Boolean
  },
  methods: {
    loadList(isOther = false) {
      let rawdata = fs.readFileSync(isOther ? this.oppositePath : this.watchPath);
      let newList = JSON.parse(rawdata);
      return newList;
    },
    addAnimeFile(anime, comment, store, watchPath) {
      let watchList = this.loadList();
      watchList.push({ name: anime, comment: comment });
      console.log(watchList);
      fs.writeFileSync(watchPath, JSON.stringify(watchList, null, 2));
      store.commit("changeAnime", true);
      return;
    },
    async addDataFile(anime, score, ranked, desc) {
      const sharedFile = path.join(
        remote.app.getPath("userData"),
        "/Core/shared.json"
      );
      let rawdata = fs.readFileSync(sharedFile);
      let otherData = JSON.parse(rawdata);
      otherData.push({
        name: anime,
        score: score,
        rank: ranked,
        description: desc
      });
      fs.writeFileSync(sharedFile, JSON.stringify(otherData, null, 2));
      return;
    },
    animeDownloadInterval(imgPath) {
      if(this.$store.getters.downloadState != 'idle')
        return;
      
      if(this.$store.getters.toDownload.length == 0) {
        clearInterval(this.$store.getters.downloadInterval);
        this.$store.commit('changeInterval', null);
        return;
      }

      const store = this.$store;
      const animes = store.getters.toDownload;
      const anime = animes[0].name;
      const comment = animes[0].comment;
      const watchPath = animes[0].watchPath;
      store.commit('shiftDownload');
      
      try {
        cloudscraper("https://myanimelist.net/search/all?q=" + anime)
        .then(htmlStr => {
          const html = parse(htmlStr);
          let animeLinks = [];
          const anchorTags = html.querySelectorAll("a");
          anchorTags.forEach(anchor => {
            const href = anchor.attributes.href;
            if (href.includes("/anime/")) {
              animeLinks.push(href);
            }
          });
          cloudscraper(encodeURI(animeLinks[1]))
          .then(htmlPage => {
            let animeImages = [];
            const html2 = parse(htmlPage);
            if (html2 == null) {
              alert("error processing anime page");
              return;
            }
            // Image
            const images = html2.querySelectorAll("img");
            // Get all /anime/ images
            images.forEach(img => {
              if (img.attributes.src != null)
                if (img.attributes.src.includes("/anime/"))
                  animeImages.push(img);
            });
            if (animeImages.length == 0) {
              alert("Cannot find image, unexpected error");
              return;
            }
            // Extras
            const score = html2.querySelector('[data-title="score"]');
            const ranked = html2
              .querySelector(".numbers.ranked")
              .querySelector("strong");
            const description = html2.querySelector(
              '[itemprop="description"]'
            );
            this.addDataFile(
              anime,
              score.innerHTML.trim(),
              ranked.innerHTML,
              description.innerHTML.replace(/(<([^>]+)>)/gi, "")
            );

            const func = this.addAnimeFile;
            download(
              encodeURI(animeImages[0].attributes.src),
              imgPath + sanitize(anime) + ".jpg",
              function() {
                console.log("done");
                store.commit('changeDownloadState', 'idle');
                func(anime, comment, store, watchPath);
              }
            );
          })
          .catch(err => {
            store.commit('changeDownloadState', 'idle');
            console.log(err);
          });
        })
        .catch(err => {
          store.commit('changeDownloadState', 'idle');
          console.log(err);
        });
      }
      catch(err) {
        store.commit('changeDownloadState', 'idle');
        console.log(err);
      }
    },
    addAnime() {
      if (this.anime == "") {
        alert("Enter anime plz :3");
        return;
      }
      const imgPath = path.join(
        remote.app.getPath("userData"),
        "/Core/Images/"
      );
      const store = this.$store;
      if (!fs.existsSync(imgPath + sanitize(this.anime) + ".jpg")) {
        // Add to list of downloads
        store.commit('addDownload', {name: this.anime, comment: this.comment, watchPath: this.watchPath });
        console.log(store.getters.toDownload);
        // Start downloader if not already started, will kill itself
        if(store.getters.downloadInterval == null)
          store.commit('changeInterval', setInterval(this.animeDownloadInterval.bind(null,imgPath), 2000));
      } else {
        this.addAnimeFile(this.anime, this.comment, store, this.watchPath);
      }
    },
    removeAnime() {
      let newList = this.loadList();
      this.selectedOptions.reverse().forEach(idx => {
        newList.splice(idx, 1);
      });
      fs.writeFileSync(this.watchPath, JSON.stringify(newList, null, 2));
      this.$store.commit("changeAnime", true);
    },
    switchAnime() {
      let newList = this.loadList();
      let newListOther = this.loadList(true);
      this.selectedOptions.reverse().forEach(idx => {
        const obj = newList[idx];
        newList.splice(idx, 1);
        newListOther.push(obj);
      });
      fs.writeFileSync(this.watchPath, JSON.stringify(newList, null, 2));
      fs.writeFileSync(this.oppositePath, JSON.stringify(newListOther, null, 2));
      this.$store.commit("changeAnime", true);
    }
  },
  mounted() {
    this.$refs.anime.focus();
  }
};
</script>

<style scoped>
.modal-card {
  width: auto;
}
.modal-card-title {
  color: white;
  padding: 0 0 5px 0;
}
.modal-card-head {
  text-align: center;
  background: #202020;
  border-bottom: 2px solid #202020;
  padding: 10px;
  border-radius: 0;
}
.modal-card-body {
  background: #202020;
  padding: 10px;
}
.modal-card-foot {
  background: #202020;
  padding: 10px;
  border: 0;
}
.main-btn {
  color: white;
  background: #ca4c1a;
  border: 0;
  margin-left: 5px;
}
.wo-margin {
  margin: 0px !important;
}
.has-divider {
  margin-right: 10px;
  padding-right: 10px;
  border-right: 2px solid #aaa;
}
</style>