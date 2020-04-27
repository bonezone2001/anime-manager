const { parse } = require('node-html-parser');  // Import html parser
const cloudscraper = require('cloudscraper');   // Import request lib capable of cloudflare scraping
const Fuse = require("fuse.js");                // Import fuse.js so we can 'fuzzy' search through arrays (approximate search)

// Fuse.js (fuzzy search)
var fuzzyOpt = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 300,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["name"]
};

// Credit to vn-ki/anime-downloader GITHUB for the headers, x-access token and idea
// Options for cloudscraper
const cloudOpt = {
    uri: 'https://twist.moe/api/anime/',
    headers: {
      'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
      'Cache-Control': 'private',
      'Accept': 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
      'x-access-token': '1rj2vRtegS8Y60B3w3qNZm5T2Q0TN2NR'
    },
    cloudflareTimeout: 5000,
    cloudflareMaxTimeout: 30000,
    followAllRedirects: true,
    challengesToSolve: 3,
    decodeEmails: false,
    gzip: true
};

module.exports = class TwistMoe {
    constructor() {
        this.animes = [];
        // Retrieve all the site's available anime
        cloudscraper(cloudOpt).then((htmlStr) =>{
            // Gather anime
            const json = JSON.parse(htmlStr);       // Scrape html (JSON)
            json.forEach(anime => {                 // loop through all the anime so we can extra specific data
                this.animes.push({                  // Add anime to list with...
                    name: anime.title,
                    link: "https://twist.moe/a/" + anime.slug.slug
                });
            });
            // Create fuse search instance
            this.fuse = new Fuse(this.animes, fuzzyOpt);
        }).catch((err) =>{ console.log(err) });
    }

    // Fairly simple function
    search(anime) {
        if(this.animes < 1)
            return "NOT_READY";
        return this.fuse.search(anime);
    }

    random() {
        return this.animes[Math.floor(Math.random() * this.animes.length)];
    }
};