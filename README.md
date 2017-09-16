<h1 align="center">
  9anime Companion
</h1>
<p align="center">
  <a href="https://travis-ci.org/lap00zza/9anime-Companion">
    <img alt="Build Status" src="https://travis-ci.org/lap00zza/9anime-Companion.svg?branch=master">
  </a>
  <a href="https://ci.appveyor.com/project/lap00zza/9anime-companion/branch/master">
    <img alt="Build status" src="https://ci.appveyor.com/api/projects/status/glkjys3aw8y9m8vb/branch/master?svg=true">
  </a>
  <a href="https://www.bithound.io/github/lap00zza/9anime-Companion">
    <img alt="bitHound Overall Score" src="https://www.bithound.io/github/lap00zza/9anime-Companion/badges/score.svg">
  </a>
  <br>
  <em>A simple companion extension for 9anime</em>
</p>
<p align="center">
    <img src="https://image.ibb.co/jHMahQ/9ac_popup.png" height="350px" width="auto" alt="Popup">
</p>

## Features
* Remove Ads/Popups <sup>[1]</sup>
* Download All episodes
* MyAnimeList Integration
* Utility Bar
* Recently Watched list
* Toggle page elements (comments, you may also like etc.)
* Helpful shortcuts
  * <kbd>s</kbd> - Alternate search overlay (global)
  * <kbd>t</kbd> - Quickly scroll to top (global)
* *and quite a few more..*
 
[1]: In my tests it removed 100% ads/popups without the need for an external adblocker. *Tested in Google Chrome Version 60.0.3112.90 (Official Build) (64-bit)*

## Download
> :information_source: 9anime Companion is tested and runs on: Chrome **60+**, Firefox **55+**
* The latest passing build of 9anime Companion can be [downloaded from appveyor](https://ci.appveyor.com/project/lap00zza/9anime-Companion/build/artifacts?branch=master). *Remember that the builds are quite frequent.*
* Want to build it yourself? check out the [Build Instructions](#build-instructions)
* **Chrome Webstore**: https://chrome.google.com/webstore/detail/9anime-companion/fopcehkidabibdmachbcpbgllhehknah
* **AMO**: https://addons.mozilla.org/en-US/firefox/addon/9anime-companion

## Links
* [Wiki](https://github.com/lap00zza/9anime-Companion/wiki)
* [Project Board](https://github.com/lap00zza/9anime-Companion/projects/2)
* Discord server: [Invite](https://discord.gg/BnAqVF9)
* Donate: [Patreon](https://www.patreon.com/lap00zza) | [Gratipay](https://gratipay.com/9anime-Companion) | [Paypal](https://www.paypal.me/lapoozza)

## Build Instructions
1. Install NodeJS
2. Install git
3. Run the following commands
   ```bash
   # Clone the repository and move inside it
   $ git clone https://github.com/lap00zza/9anime-Companion.git
   $ cd 9anime-Companion

   # install dependencies
   $ npm install

   # Build the extension. If gulp command is not working, it means 
   # you dont have gulp-cli. You can either download gulp-cli or use
   # npm run build.
   $ gulp
   ```
4. Check `dist/chromium` and `dist/firefox` for the built extension.
5. *Optional:* since the project is in Typescript, be sure to use a editor like [VSCode](https://code.visualstudio.com/) to take full advantage.
6. *Optional:* check out the instructions for [Running in Developement Mode](https://github.com/lap00zza/9anime-Companion/wiki/Running-in-Developement-Mode)

> :information_source: Check `gulpfile.js` and `package.json` for all the available tasks

## Want to contribute?
Check out [CONTRIBUTING.md](https://github.com/lap00zza/9anime-Companion/blob/master/.github/CONTRIBUTING.md)

## License
[MIT](https://github.com/lap00zza/9anime-Companion/blob/master/LICENSE)

Copyright (c) 2017 Jewel Mahanta
