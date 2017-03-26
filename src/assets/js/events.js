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

// This module is responsible for listening to events from the
// main interface. This module runs in the background.
// TODO: maybe add some unit tests for the functions?
(function () {

    // Bind this to window object so that we can easily
    // test it out as well.
    var animeUtils = window.animeUtils = window.animeUtils || {};

    animeUtils.defaultSettings = {
        adsToggle: 1,
        playerSizeToggle: 1,
        minimalModeToggle: 0,
        pinIconToggle: 1
    };

    // Helper functions
    animeUtils.helper = {

        /**
         * This helper function will help us test whether a given string is a URL.
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
         * TODO: this needs to be tested properly
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
    function checkIfEntryExists(pinnedAnimeList, animeUrl) {

        for (var i = 0; i < pinnedAnimeList.length; i++) {
            if (pinnedAnimeList[i].url === animeUrl) {
                return true;
            }
        }
        return false;
    }

    /**
     * This function extracts anime and episode id from the url
     *
     * TODO: this needs to be tested properly
     * @param url
     * @returns {{animeId: *, episodeId: *}}
     */
    animeUtils.extractIdFromUrl = function extractIdFromUrl(url) {
        var anime_id = null;
        var episode_id = null;

        if (this.helper.isUrl(url)) {
            // This regex will split the url such that we get the id/episode_id
            // Using this as the example link: http://9anime.to/watch/ao-haru-ride.qk5n/vpz64
            // we should get ["", "qk5n/vpz64"]
            var re = /(?:http|https):\/\/9anime\.[a-z]+\/watch\/.+\./;
            var splitUrl = url.split(re);

            if (splitUrl.length === 2) {
                // The we split that into Anime ID and Episode ID
                var details = splitUrl[1].split("/");

                if (details.length > 1) {
                    anime_id = details[0];
                    episode_id = details[1];
                }
            }
        }

        return {
            animeId: anime_id,
            episodeId: episode_id
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
        var pinned = [];
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get({
                pinnedList: []

            }, function (values) {

                pinned = values["pinnedList"];
                // console.log(pinned);

                // Check if this entry already exists. If it does not
                // exist add it to the list. Else discard.
                if (!checkIfEntryExists(pinned, url)) {
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
        });

    };

    /**
     * Remove a anime from the pinned list.
     *
     * @param url
     * @returns {Promise}
     */
    animeUtils.removeFromPinnedList = function removeFromPinnedList(url) {

        var pinned = [];
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get({
                pinnedList: []

            }, function (values) {

                pinned = values["pinnedList"];
                for (var i = 0; i < pinned.length; i++) {
                    if (pinned[i].url === url) {
                        pinned.splice(i, 1);
                    }
                }

                chrome.storage.local.set({
                    pinnedList: pinned
                });

                console.log(pinned, url);

                resolve({
                    result: "success",
                    itemCount: pinned.length
                });
            });
        });
    };

})();

//noinspection JSCheckFunctionSignatures
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.intent === "hello") {
            sendResponse({result: "Background page is working properly."});
        }

        else if (request.intent === "open_9anime") {
            chrome.tabs.create({'url': "https://9anime.to"});
            sendResponse({result: "opened"});
        }

        else if (request.intent === "open_anime") {
            if (animeUtils.helper.isUrl(request.anime_url)) {
                chrome.tabs.create({'url': request.anime_url});
                sendResponse({result: "opened"});
            }
        }

        else if (request.intent === "addPinnedAnime") {
            // Validate the url before adding it to list
            if (request.animeName && animeUtils.helper.isUrl(request.animeUrl)) {
                // console.log(name, url);
                var pinPromise = animeUtils.addToPinnedList(request.animeName, request.animeUrl);
                pinPromise.then(function (status) {
                    sendResponse({
                        result: status
                    });
                });

                // We return true to indicate we wish to send a response
                // asynchronously (this will keep the message channel
                // open to the other end until sendResponse is called)
                return true;

            } else {
                sendResponse({
                    result: "fail"
                });
            }
        }

        else if (request.intent === "removePinnedAnime") {
            if (animeUtils.helper.isUrl(request.animeUrl)) {
                var remPinPromise = animeUtils.removeFromPinnedList(request.animeUrl);

                remPinPromise.then(function (status) {
                    sendResponse({
                        result: status.result,
                        itemCount: status.itemCount
                    });
                });

                return true;
            } else {
                sendResponse({
                    result: "fail"
                });
            }
        }
    }
);

//noinspection JSCheckFunctionSignatures
chrome.runtime.onInstalled.addListener(function (details) {
    // Initializing the default settings
    if (details.reason === "install") {
        console.log("New install: Saving the default settings to localStorage", animeUtils.defaultSettings);
        chrome.storage.local.set(animeUtils.defaultSettings);
    }
});
