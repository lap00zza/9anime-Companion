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
//noinspection JSCheckFunctionSignatures
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.intent) {

            /**********************************************************************************************************/
            case "hello":
                sendResponse({
                    result: "Background page is working properly."
                });
                break;

            /**********************************************************************************************************/
            case "findInMal":
                if (request.animeName) {
                    chrome.tabs.create({
                        "url": encodeURI("https://myanimelist.net/anime.php?q=" + request.animeName)
                    });
                    sendResponse({
                        result: "opened"
                    });
                }
                break;

            /**********************************************************************************************************/
            case "removeMALCredentials":
                window.mal.removeCredentials();
                break;
            
            /**********************************************************************************************************/
            case "verifyAndSetCredentials":
                window
                    .mal
                    .verifyAndSetCredentials(request.username, request.password)
                    .then(function () {
                        sendResponse({
                            result: "success"
                        })
                    })
                    .catch(function () {
                        sendResponse({
                            result: "fail"
                        });
                    });
                return true;


            /**********************************************************************************************************/
            case "searchMal":
                if (request.animeName) {
                    window
                        .mal
                        .searchAnime(request.animeName)
                        .then(function (response) {
                            sendResponse({
                                result: "success",
                                data: response
                            });
                        })
                        .catch(function (response) {
                            sendResponse({
                                result: "fail",
                                reason: response
                            });
                        });
                    return true;
                } else {
                    sendResponse({
                        result: "fail",
                        reason: "animeName is missing"
                    });
                }
                break;

            /**********************************************************************************************************/
            case "getUserList":
                window
                    .mal
                    .getUserList()
                    .then(function (response) {
                        sendResponse({
                            result: "success",
                            data: response
                        });
                    })
                    .catch(function (reason) {
                        sendResponse({
                            result: "fail",
                            reason: reason
                        });
                    });
                return true;

            /**********************************************************************************************************/
            case "addMal":
                if (request.animeId) {
                    // console.log(request);
                    window
                        .mal
                        .addAnime(request.animeId)
                        .then(function () {
                            var opt = {
                                type: "basic",
                                title: "Success!",
                                message: "Added to your MAL.",
                                iconUrl: chrome.extension.getURL("assets/images/notification_icon.png")
                            };
                            chrome.notifications.create(opt);

                            sendResponse({
                                result: "success"
                            });
                        })
                        .catch(function () {
                            var opt = {
                                type: "basic",
                                title: "Error!",
                                message: "There was an error adding anime to your MAL. Please try again.",
                                iconUrl: chrome.extension.getURL("assets/images/notification_icon.png")
                            };
                            chrome.notifications.create(opt);

                            sendResponse({
                                result: "fail",
                                reason: "error"
                            });
                        });
                    return true;
                } else {
                    sendResponse({
                        result: "fail",
                        reason: "animeId is missing"
                    });
                }
                break;

            /**********************************************************************************************************/
            case "updateMal":
                if (request.animeId) {
                    // console.log(request);
                    window
                        .mal
                        .updateAnime(request.animeId, request.episode)
                        .then(function () {
                            var opt = {
                                type: "basic",
                                title: "Success!",
                                message: "Updated your MAL",
                                iconUrl: chrome.extension.getURL("assets/images/notification_icon.png")
                            };
                            chrome.notifications.create(opt);

                            sendResponse({
                                result: "success",
                                reason: "<3 baby"
                            });
                        })
                        .catch(function () {
                            var opt = {
                                type: "basic",
                                title: "Error!",
                                message: "There was an error updating your MAL. Please try again.",
                                iconUrl: chrome.extension.getURL("assets/images/notification_icon.png")
                            };
                            chrome.notifications.create(opt);

                            sendResponse({
                                result: "fail",
                                reason: "error"
                            });
                        });
                    return true;
                } else {
                    sendResponse({
                        result: "fail",
                        reason: "animeId is missing"
                    });
                }
                break;

            /**********************************************************************************************************/
            // TODO: url match does not seem to work with firefox 
            // lets instead query tabs by name till firefox supports extension url match?
            case "openOptions":

                var optionsUrl = chrome.extension.getURL("options.html");
                // var pos = optionsUrl.indexOf('#');
                // var cleanUrl;
                //
                // if (pos === -1) {
                //     cleanUrl = optionsUrl;
                // } else {
                //     cleanUrl = optionsUrl.slice(0, pos);
                // }

                chrome.tabs.query({title: "9anime Companion - Options"}, function (response) {
                    // console.log(response);
                    if (response.length === 0) {
                        chrome.tabs.create({
                            "url": optionsUrl
                        });
                    } else {
                        chrome.tabs.update(response[0].id, {active: true});
                    }
                });
                break;

            /**********************************************************************************************************/
            case "openRedditDiscussion":
                if (request.animeName) {
                    // Change the replace part with regex
                    var cleanedTitle = request.animeName.replace(/\(DUB\)|\(SUB\)|\(TV\)/gi, "").trim();
                    var url = "https://www.reddit.com/r/anime/search?q=";

                    if (!request.episode) {
                        var titleText = `title:"${cleanedTitle}"`;
                        if (request.alternateNames.length > 0) {
                            request.alternateNames.forEach(function (name) {
                                titleText += ` OR title:"${name}"`;
                            });
                        }

                        // Deciding whether to add (selftext:MyAnimelist OR selftext:MAL) or not
                        // as not all discussion threads have MAL links. For now I will not add.
                        var params = `subreddit:anime self:yes title:"[Spoilers]" title:"[Discussion]" (${titleText})`;
                        chrome.tabs.create({
                            "url": encodeURI(url + params + "&sort=new")
                        });
                        sendResponse({
                            result: "opened"
                        });

                    } else if (request.episode) {
                        var titleText1 = `title:"${cleanedTitle} Episode ${request.episode}"`;
                        if (request.alternateNames.length > 0) {
                            request.alternateNames.forEach(function (name) {
                                titleText1 += ` OR title:"${name} Episode ${request.episode}"`;
                            });
                        }

                        // Deciding whether to add (selftext:MyAnimelist OR selftext:MAL) or not
                        // as not all discussion threads have MAL links. For now I will not add.
                        var params1 = `subreddit:anime self:yes title:"[Spoilers]" title:"[Discussion]" (${titleText1})`;
                        chrome.tabs.create({
                            "url": encodeURI(url + params1 + "&sort=new")
                        });
                        sendResponse({
                            result: "opened"
                        });
                    }
                } else {
                    sendResponse({
                        result: "fail"
                    });
                }
                break;

            /**********************************************************************************************************/
            case "downloadFiles":
                window.downloadAll.downloadFiles(request.episodes, request.animeName, request.quality);
                break;
        }
    }
);

//noinspection JSCheckFunctionSignatures
chrome.runtime.onInstalled.addListener(function (details) {
    // console.log(details);
    if (details.reason === "install") {
        console.log("New install: Saving the default settings to localStorage");
        chrome.storage.local.set({
            installType: "fresh",
            installedOn: (new Date()).toISOString(),
            installModalShown: false
        });

        // Initializing the default settings
        chrome.storage.local.set(window.animeUtils.defaultSettings);
        // chrome.tabs.create({
        //     "url": chrome.extension.getURL("options.html")
        // });
    }

    if (details.reason === "update") {
        console.log("Update: Preserving old settings and adding new ones");
        chrome.storage.local.set({
            installType: "update",
            installedOn: (new Date()).toISOString(),
            installModalShown: false
        });

        // Preserve the previous settings and add
        // the new default settings.
        var optionElements = Object.keys(window.animeUtils.defaultSettings);
        var newSettings = {};
        chrome.storage.local.get(optionElements, function (previousSettings) {
            optionElements.forEach(function (option) {
                if (previousSettings[option] === undefined) {
                    newSettings[option] = window.animeUtils.defaultSettings[option];

                } else {
                    newSettings[option] = previousSettings[option];
                }
            });
        });

        // console.log(newSettings);
        chrome.storage.local.set(newSettings);

        // Open the options page, which should then show
        // the updated notification modal.
        // TODO: uncomment it before pushing. DON'T FORGET
        // chrome.tabs.create({
        //     "url": chrome.extension.getURL("options.html")
        // });
    }
});
