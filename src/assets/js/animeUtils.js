/**
 *  MIT License
 *
 *  Copyright (c) 2017 Jewel Mahanta
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

// This module contains the utility functions which can
// be used globally.

// NOTE: 
// Unit Tests for this can be found in animeUtils.spec.js 
// in the test/unit directory.
(function () {

    // Bind this to window object so that we can easily
    // test it out as well.
    var animeUtils = window.animeUtils = window.animeUtils || {};
    
    // Every single settings and their default values are 
    // present here. 1 = ON, 0 = OFF
    animeUtils.defaultSettings = {
        adsToggle: 1,
        playerSizeToggle: 1,
        minimalModeToggle: 0,
        pinIconToggle: 1,
        shareBarToggle: 1,
        commentsToggle: 0,
        youMightAlsoLikeToggle: 0,
        utilityBarToggle: 1
    };

    /**
     * This function gets the user settings and resolves this settings
     * object once done.
     * 
     * @param key: This parameter is optional. If it is empty, then the entire
     *              settings object will be passed. If specific options are mentioned
     *              in the key, then only those will be present in the settings object.
     * @returns {Promise}
     */
    animeUtils.loadSettings = function (key) {
        return new Promise (function (resolve, reject) {
            if ((key && key instanceof Array) || (!key)) {
                var optionElements = Object.keys(animeUtils.defaultSettings);
                var fetchArray = key || optionElements;

                chrome.storage.local.get(fetchArray, function (values) {
                    var settings = {};

                    for (var i = 0; i < fetchArray.length; i++) {
                        var option = fetchArray[i];
                        if (values[option] === undefined) {
                            settings[option] = !!animeUtils.defaultSettings[option];
                        } else {
                            settings[option] = !!values[option];
                        }
                    }
                    
                    // Once we load the settings, we resolve our promise.
                    resolve(settings);
                });
            } else {
                reject("key not an array")
            }
        });
    };

    // Helper functions
    animeUtils.helper = {

        /**
         * A simple helper function which returns the keys of the default settings
         * as arrays.
         * 
         * @returns {Array}
         */
        settingsKeys: function () {
            return Object.keys(animeUtils.defaultSettings);
        },

        /**
         * This helper function will help us test whether a given string is a URL.
         * 
         * @param urlString
         * @returns {boolean}
         */
        isUrl: function (urlString) {
            var re_url = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            return !!urlString.match(re_url);
        },

        /**
         * This function checks whether this url refers to http or https
         * version of the site.
         *
         * @param urlString
         */
        isHttps: function (urlString) {
            var re_url = /^(https):/;
            return !!urlString.match(re_url);
        }
    };


    /**
     * Checks if a entry already exists in the current pinned anime list.
     * If this entry exists, returns boolean true. Else returns boolean
     * false. This is used to avoid duplicate pinned list entries.
     *
     * @param pinnedAnimeList
     * @param animeUrl
     * @returns {boolean}
     */
    animeUtils.checkIfEntryExists = function (pinnedAnimeList, animeUrl) {

        for (var i = 0; i < pinnedAnimeList.length; i++) {
            if (pinnedAnimeList[i].url === animeUrl) {
                return true;
            }
        }
        return false;
    };

    /**
     * This function extracts animeUrl, animeId and episode id from the url.
     *
     * @param url
     * @returns {{animeUrl: *, animeId: *, episodeId: *}}
     */
    animeUtils.extractIdFromUrl = function extractIdFromUrl(url) {
        var animeId = null;
        var episodeId = null;
        var baseUrl = null;

        if (animeUtils.helper.isUrl(url)) {
            // Using this as the example link: http://9anime.to/watch/ao-haru-ride.qk5n/vpz64
            // ---
            // This regex will be used to split the url to get the id/episode_id
            // => we should get ["", "qk5n/vpz64"]
            //
            // This regex will be used to match the url to get the id/episode_id
            // => we should get ["https://9anime.to/watch/gabriel-dropout."]
            // We then take the first element, i.e. [0]
            var re = /(?:http|https):\/\/9anime\.[a-z]+\/watch\/.+\./i;
            baseUrl = url.match(re)[0];
            var splitUrl = url.split(re);

            if (splitUrl.length === 2) {
                // The we split that into Anime ID and Episode ID
                var details = splitUrl[1].split("/");

                if (details.length > 1) {
                    animeId = details[0];
                    episodeId = details[1];
                }
            }
        }

        return {
            animeUrl: baseUrl + animeId,
            animeId: animeId,
            episodeId: episodeId
        }
    };

    /**
     * Add a new anime to the pinned list.
     *
     * @param name
     * @param url
     * @returns {Promise}
     */
    animeUtils.addToPinnedList = function addToPinnedList(name, url) {
        return new Promise(function (resolve, reject) {
            if (name && animeUtils.helper.isUrl(url)) {
                chrome.storage.local.get({
                    pinnedList: []

                }, function (values) {

                    var pinned = values["pinnedList"];
                    // console.log(pinned);

                    // Check if this entry already exists. If it does not
                    // exist add it to the list. Else resolve as duplicate.
                    if (!animeUtils.checkIfEntryExists(pinned, url)) {
                        pinned.push({
                            name: name,
                            url: url
                        });

                        chrome.storage.local.set({
                            pinnedList: pinned
                        });

                        // console.log("Pinned:", name, url);
                        resolve("success");
                    } else {
                        resolve("duplicate");
                    }
                });
            } else {
                // TODO: add something descriptive here?
                reject("error");
            }
        });

    };

    /**
     * Remove a anime from the pinned list.
     *
     * @param url
     * @returns {Promise}
     */
    animeUtils.removeFromPinnedList = function removeFromPinnedList(url) {
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get({
                pinnedList: []

            }, function (values) {

                var pinned = values["pinnedList"];

                // Check if this entry already exists. If it does
                // exist remove from the list. Else reject promise.
                if(animeUtils.checkIfEntryExists(pinned, url)) {
                    for (var i = 0; i < pinned.length; i++) {
                        if (pinned[i].url === url) {
                            pinned.splice(i, 1);
                        }
                    }

                    chrome.storage.local.set({
                        pinnedList: pinned
                    });

                    // console.log("Removed: ", url);
                    resolve({
                        result: "success",
                        itemCount: pinned.length
                    });
                } else {
                    reject("does not exist");
                }
            });
        });
    };

})();