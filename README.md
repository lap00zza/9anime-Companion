This is the rewrite branch. All contributions are welcome.
<hr>
<h1 align="center">
  9anime Companion
</h1>
<p align="center">
    <a href="https://travis-ci.org/lap00zza/9anime-Companion">
        <img src="https://travis-ci.org/lap00zza/9anime-Companion.svg?branch=rewrite%2Ftypescript" alt="Build Status">
    </a>
    <a href="https://ci.appveyor.com/project/lap00zza/9anime-Companion/branch/rewrite/typescript">
        <img src="https://ci.appveyor.com/api/projects/status/glkjys3aw8y9m8vb/branch/rewrite/typescript?svg=true" alt="Build Status">
    </a>
</p>
<p align="center"><em>A simple companion extension for 9anime</em></p>
<p align="center">
    <img src="https://image.ibb.co/jhPg4v/popup.png" height="350px" width="auto" alt="Popup">
</p>

## Features
* Remove Ads/Popups <sup>[1]</sup>
* Download All episodes
* MyAnimeList Integration
* Utility Bar
* Recently Watched list
* Toggle page elements (comments, you may also like etc.)
* *and quite a few more..*
 
[1]: In my tests it removed 100% ads/popups without the need for an external adblocker. *Tested in Google Chrome Version 60.0.3112.90 (Official Build) (64-bit)*

## Download
* The latest passing build of 9anime Companion can be [downloaded from appveyor](https://ci.appveyor.com/project/lap00zza/9anime-Companion/build/artifacts?branch=rewrite%2Ftypescript). *Remember that the builds are quite frequent.*
* Want to build it yourself? check out [Build Instructions](#build-instructions)
* **This version is not yet published to Chrome Webstore or AMO**. Those links will be updated here as soon as it is published.

## Build Instructions
1. Install NodeJS
2. Install git
3. Run the following commands
   ```bash
    $ git clone https://github.com/lap00zza/9anime-Companion.git
    $ git checkout rewrite/typescript
    
    # install dependencies
    $ npm install
 
    # Build the extension. If gulp command is not working, it means 
    # you dont have gulp-cli. You can either download gulp-cli or use
    # npm run build.
    $ gulp
    ```
4. Check the `dist/chromium` for the built extension.
5. *Optional:* since the project is in Typescript, be sure to use a editor like [VSCode](https://code.visualstudio.com/) to take full advantage.
6. *Optional:* check out the instructions for [Running in Developement Mode](https://github.com/lap00zza/9anime-Companion/wiki/Running-in-Developement-Mode)

> :information_source: Check `gulpfile.js` and `package.json` for all the available tasks

## Progress Tracker
- [x] Download All
- [x] Remove ads/popups
- [x] MyAnimeList Integration
- [x] Recently Watched List
- [ ] Pinned Anime List
- [x] Settings Page
- [ ] Popup (**partially done**)

and the ones suggested by @densityx here: https://github.com/lap00zza/9anime-Companion/issues/31

## Want to contribute?
Check out [CONTRIBUTING.md](https://github.com/lap00zza/9anime-Companion/blob/rewrite/typescript/.github/CONTRIBUTING.md)

## License
[MIT](https://github.com/lap00zza/9anime-Companion/blob/rewrite/typescript/LICENSE)

Copyright (c) 2017 Jewel Mahanta
