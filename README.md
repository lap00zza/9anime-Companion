This is the rewrite branch. Contributions are welcome :smile:
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

## Download
* The latest passing build of 9anime Companion can be downloaded from [here](https://ci.appveyor.com/project/lap00zza/9anime-Companion/build/artifacts?branch=rewrite%2Ftypescript). *Remember that the builds are quite frequent.*
* If you want to build it yourself, check out [How to set up?](#how-to-set-up)
* **This version is not yet published to Chrome Webstore or AMO**. Those links will be updated here as soon as it is published.

## How to set up?
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

> :information_source: Check `gulpfile.js` and `package.json` for all the available tasks

## Progress Tracker
- [x] Download All
- [x] Remove ads/popups
- [x] MyAnimeList Integration
- [x] Recently Watched List
- [ ] Pinned Anime List
- [x] Settings Page

and the ones suggested by @densityx here: https://github.com/lap00zza/9anime-Companion/issues/31

## Want to contribute?
Check out [CONTRIBUTING.md](https://github.com/lap00zza/9anime-Companion/blob/rewrite/typescript/.github/CONTRIBUTING.md)

## License
[MIT](https://github.com/lap00zza/9anime-Companion/blob/rewrite/typescript/LICENSE)

Copyright (c) 2017 Jewel Mahanta
