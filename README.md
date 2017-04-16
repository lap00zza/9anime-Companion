## 9anime Companion
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/lap00zza/9anime-Companion/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/lap00zza/9anime-Companion.svg?branch=master)](https://travis-ci.org/lap00zza/9anime-Companion)

A simple companion extension for 9anime
<p align="center"><img src="https://image.ibb.co/chDnYv/ui.png"></p>

### Features
* Remove Ads
* Minimal Mode (only player and episode list)
* Pinned Anime List
* Ability to **Download All** episodes
* MyAnimeList Integration
* Utility Bar
* Ability to toggle elements (*comments, you may also like etc.*) in the watch page
* *and quite a few more*

### Downloads
* **Firefox**: https://addons.mozilla.org/en-US/firefox/addon/9anime-companion/
* **Chrome**: https://chrome.google.com/webstore/detail/9anime-companion/fopcehkidabibdmachbcpbgllhehknah


Note: The firefox official version is outdated because of how slow the AMO review process is. I would suggest using it from the developement channel or downloading it from [Releases](https://github.com/lap00zza/9anime-Companion/releases)

### Build Instructions
If you want to build this extension yourself, follow these instructions:
```
git clone https://github.com/lap00zza/9anime-Companion.git
cd 9anime-Companion
npm install
```
After that, use one the following gulp tasks
1. To make the extension use: `gulp make_chrome` or `gulp make_firefox`.
2. To get a zipped version of the extensions use: `gulp zip_chrome` or `gulp zip_firefox`
3. To run the tests, use `gulp test`

Once done, check the `dist` directory.

### Instructions for running in Developement Mode
**Chrome**
1. Either [build it yourself](https://github.com/lap00zza/9anime-Companion#build-instructions), or download `9anime_Companion_chrome.zip` from: [Releases](https://github.com/lap00zza/9anime-Companion/releases) and extract it. (Make sure to use latest release)
2. Open Chrome. Then Settings > Extensions. Check *Developer mode*.
3. Click *Load unpacked extension...*
4.  * **If you built it from source**: select the **9anime-Companion/dist** directory. 
    * **If you downloaded zip from Releases**: select the extracted location.

**Firefox**
1. Either [build it yourself](https://github.com/lap00zza/9anime-Companion#build-instructions), or download `9anime_Companion_firefox.zip` from: [Releases](https://github.com/lap00zza/9anime-Companion/releases) and extract it. (Make sure to use latest release)
2. Open Firefox. Then enter `about:debugging` in the URL bar and press enter.
3. Click *Load Temporary Add-on*
4.  * **If you built it from source**: select the **9anime-Companion/dist** directory. 
    * **If you downloaded zip from Releases**: select the extracted location.

### Tests
Tests can be found within the `test` directory.

## Acknowledgements
9anime Companion uses these awesome open source projects:
<table>
<tr>
<td><a href="https://github.com/gulpjs/gulp"><img src="https://image.ibb.co/gEjWi5/gulp_256.png"></a></td>
<td><a href="https://github.com/jasmine/jasmine"><img src="https://image.ibb.co/iXrYwQ/jasmine_256.png"></a></td>
<td><a href="https://github.com/karma-runner/karma"><img src="https://image.ibb.co/dH3fbQ/karma_256.png"></a></td>
<td><a href="https://github.com/webpack/webpack"><img src="https://image.ibb.co/kNCvAk/webpack_256.png"></a></td>
</tr>
</table>

## License
Copyright (c) 2017 Jewel Mahanta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
