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
    // TODO: https://github.com/gorhill/uBlock/blob/master/src/js/messaging.js#L55 | use switch case?
    function (request, sender, sendResponse) {
        switch (request.intent) {
            case "hello":
                sendResponse({result: "Background page is working properly."});
                break;

            case "open_9anime":
                chrome.tabs.create({'url': "https://9anime.to"});
                sendResponse({result: "opened"});
                break;

            case "open_anime":
                if (window.animeUtils.helper.isUrl(request.animeUrl)) {
                    chrome.tabs.create({'url': request.animeUrl});
                    sendResponse({result: "opened"});
                }
                break;

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

            case "extractIdFromUrl":
                if (window.animeUtils.helper.isUrl(request.animeUrl)) {
                    sendResponse({
                        result: "success",
                        data: window.animeUtils.extractIdFromUrl(request.animeUrl)
                    });
                }
                break;

            case "openRedditDiscussion":
                if (request.animeName) {
                    var cleanedTitle = request.animeName.replace(" (TV)", "").replace(" (Sub)", "").replace(" (Dub)", "").trim();
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

            case "addPinnedAnime":
                // Validate the url before adding it to list
                if (request.animeName && window.animeUtils.helper.isUrl(request.animeUrl)) {
                    // console.log(name, url);
                    var pinPromise = window.animeUtils.addToPinnedList(request.animeName, request.animeUrl);
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
                break;

            case "removePinnedAnime":
                if (window.animeUtils.helper.isUrl(request.animeUrl)) {
                    var remPinPromise = window.animeUtils.removeFromPinnedList(request.animeUrl);

                    remPinPromise.then(function (status) {
                        sendResponse({
                            result: status.result,
                            itemCount: status.itemCount
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
                break;
        }
    }
);

//noinspection JSCheckFunctionSignatures
chrome.runtime.onInstalled.addListener(function (details) {
    // Initializing the default settings
    if (details.reason === "install") {
        console.log("New install: Saving the default settings to localStorage", window.animeUtils.defaultSettings);
        chrome.storage.local.set(window.animeUtils.defaultSettings);
    }
});
