# Anime Management
A tool to let me store the anime i have watched and plan to watch with the addition of a description, rating, score, personal comments and the ability to instantly get the anime watch page. The main idea behind this program was just to allow me to quickly and easily see what anime i plan to watch and be able to get to it quickly. This program is a remake of an old C# application I made and released on MAL (MyAnimeList) at the age of 16. That version of the application was created in C# using the WPF Microsoft GUI framework which is a pain to deal with. https://myanimelist.net/forum/?topicid=1622794

# Motivation
The application was pretty much made as a way for me to quickly learn how to use electron and vuejs. Thinking back, I should have done some more research since I found that CEF and Ultralig.ht exist and are in languages that I am much better at (C++ or C#, Mainly C++). But here we are, a vuejs/electron cross world thing.

# Comments
The application was origianlly just meant to be something-something for myself, you know. However, a friend of mine wanted to start learning vuejs along side me. So I started commenting the code in order to allow him to understand what was going on. Some of the files were not commented since I got lazy and figured he was starting to get the hang of it without my help so I am sorry if the comments are directed towards somebody personally or if some of the files are not commented to the best of my ability. I shall eventually get around to fixing it but it shall remain that way for now.

# Get started
## Run the code
#### Yarn
```javascript
yarn install
yarn add electron
yarn electron:serve
```

#### NPM
```javascript
npm install
npm install electron
npm run electron:serve
```

## Entry point
The code entry point for vuejs is main.js, this code will initialize vuejs and essentially be imported into the renderer for electron. You should be able to follow the code trail from there.
The code entry point for electron is background.js, this code will start up electron.

# Credits
Credit to vn-ki on github for twist.moe indexing idea and implementation. Never knew bypasses for cloudflare were a thing.
https://github.com/vn-ki/anime-downloader/blob/master/anime_downloader/sites/twistmoe.py

Credit to nklayman for the electron-vuejs CLI plugin used to initialize the program.
https://github.com/nklayman/vue-cli-plugin-electron-builder

Frameworks Used:
https://electronjs.org/
https://vuejs.org/
https://buefy.org/
