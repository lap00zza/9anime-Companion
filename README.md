## 9anime Companion
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/lap00zza/9anime-Companion/blob/master/LICENSE)


A simple companion extension for 9anime

### Features
* Remove Ads
* Resize/Center the player
* Minimal Mode (only player and episode list)
* Last Watched
* Quick Link

### Downloads
* **Firefox**: https://addons.mozilla.org/en-US/firefox/addon/9anime-companion/
* **Chrome**: Not yet published to the webstore (use in developer mode)

### Build Instructions
If you want to build this extension yourself, the follow these instructions:
```
git clone https://github.com/lap00zza/9anime-Companion.git
cd 9anime-Companion
npm install
```
After that, use one the following gulp tasks
1. To make the extension use: `gulp make_chrome` or `gulp make_firefox`.
2. To get a zipped version of the extensions use: `gulp zip_chrome` or `gulp zip_firefox`

Once done, check the `dist` directory. Enjoy!

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
