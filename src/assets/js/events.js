/**
 * This module is responsible for listening to events from the
 * main interface. This module runs in the background.
 */
// TODO: maybe add some unit tests for the functions?
(function () {
    /**
     * This helper function will help us test whether a given string is a URL.
     *
     * @param urlString
     * @returns {boolean}
     */
    function isUrl(urlString) {
        var re_url = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        return !!urlString.match(re_url);
    }

    /**
     * This function checks whether this url refers to http or https
     * version of the site.
     *
     * TODO: this needs to be tested properly
     *
     * @param urlString
     */
    function isHttps(urlString) {
        var re_url = /^(https):/;
        return !!urlString.match(re_url);
    }

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
     * Add a new anime to the pinned list.
     *
     * @param name
     * @param url
     * @returns {Promise}
     */
    function addToPinnedList(name, url) {
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

    }

    /**
     * Remove a anime from the pinned list.
     * 
     * @param url
     * @returns {Promise}
     */
    function removeFromPinnedList(url) {

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
    }


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
                if (isUrl(request.anime_url)) {
                    chrome.tabs.create({'url': request.anime_url});
                    sendResponse({result: "opened"});
                }
            }

            else if (request.intent === "addPinnedAnime") {
                // Validate the url before adding it to list
                if (request.animeName && isUrl(request.animeUrl)) {
                    // console.log(name, url);
                    var pinPromise = addToPinnedList(request.animeName, request.animeUrl);
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
                if (isUrl(request.animeUrl)) {
                    var remPinPromise = removeFromPinnedList(request.animeUrl);
                    
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
})();