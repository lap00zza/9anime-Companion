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

// This script handles all the functionality in the watch page.
// TODO: Utility Bar should be toggleable
(function ($) {
    // Initializing all the variables for 9Anime Companion
    // Some of the default values are necessary as fallback measure.
    var removeAds,
        resizePlayer,
        minimalMode,
        pinAnimeIcon,
        playerWidth = 1, // this ranges from 0 to 1
        defaultSettings = {
            adsToggle: 1,
            playerSizeToggle: 1,
            minimalModeToggle: 0,
            pinIconToggle: 1
        },
        optionElements = Object.keys(defaultSettings);

    // Ads Locations
    // TODO: add a way to update the ads locations remotely via updates
    var adsLocations = [
        "#movie > div.container.player-wrapper > div > div.col-lg-7.col-sm-24.sidebar",
        "#movie > div.widget.info > div:nth-child(1) > div > div.col-md-7",
        "#movie > div.widget.info > div:nth-child(1) > div > div > div.widget.mt20.a_d",
        "#movie > div.widget.info > div:nth-child(1) > div > div > div.hidden-xs.a_d"
    ];

    // Other important locations
    var player = $("#player"),
        infoDiv = $("#info"),
        movieDiv = $("#movie"),
        commentDiv = $("#comment"),
        playerDiv = $(movieDiv).find("div.container.player-wrapper > div > div.col-lg-17.col-sm-24"),
        topNotificationBar = $(movieDiv).find("div.container.player-wrapper > div > div.col-xs-24"),
        titleDiv = $(movieDiv).find("div.widget.info > div > div > div > h1"),
        suggestedDiv = $(movieDiv).find("div.widget.info > div.widget.container"),
        episodeListDiv = $(movieDiv).find("> div.widget.info > div > div > div"),
        playerParent = $(movieDiv).find("div.container.player-wrapper > div > div.col-lg-17.col-sm-24");

    // Web Accessible Resource URL's
    var pinImage = chrome.extension.getURL("assets/images/pin.png");

    function adsRemover() {
        for (var i = 0; i < adsLocations.length; i++) {
            $(adsLocations[i]).remove();
        }
    }

    function playerResizer() {
        if (playerWidth > 0 && playerWidth < 1) {
            $(playerDiv).css({width: (playerWidth * 100) + "%", paddingLeft: ((1 - playerWidth) * 100) + "%"});
            $(topNotificationBar).css({width: (playerWidth * 100) + "%", paddingLeft: ((1 - playerWidth) * 100) + "%"});

        } else if (playerWidth === 1) {
            $(playerDiv).css({width: "100%"});
            $(topNotificationBar).css({width: "100%"});

        } else {
            // TODO: handle this case when playerWidth is 0
        }
    }
    
    // Load Settings. In case the settings are missing, we will use
    // default settings.
    var settingsLoadedPromise = new Promise(function (resolve, reject) {
        chrome.storage.local.get(optionElements, function (values) {

            removeAds = !!values["adsToggle"] || !!defaultSettings["adsToggle"];
            resizePlayer = !!values["playerSizeToggle"] || !!defaultSettings["playerSizeToggle"];
            minimalMode = !!values["minimalModeToggle"] || !!defaultSettings["minimalModeToggle"];
            pinAnimeIcon = !!values["pinIconToggle"] || !!defaultSettings["pinIconToggle"];

            // Once we load the settings, we resolve our promise.
            resolve();
        });
    });

    settingsLoadedPromise.then(function () {

        // Minimal Mode
        // This mode will also remove ads and resize/center player,
        // regardless of whether this option is chosen or not.
        if (minimalMode) {
            $(suggestedDiv).remove();
            $(commentDiv).remove();
            $(infoDiv).remove();
            $(titleDiv).remove();
            $(episodeListDiv).css({width: "100%"});

            adsRemover();
            playerResizer();
        }

        // Ads Removal
        if (!minimalMode && removeAds) {
            // console.log("Oui Ads");
            adsRemover();
        }

        // Player Resizer
        if (!minimalMode && resizePlayer) {
            // console.log("Oui Resize");
            playerResizer();
        }

        if (pinAnimeIcon) {
            // This portion deals with attaching the utility bar
            // at the bottom of the player. This bar provide quite
            // a few functionality like pin etc.
            if ($(player).length > 0) {
                $(playerParent)
                    .append(`<div class="player_utilities"><div id="pin_Utility" class="utility_item"><img src='${pinImage}'>Pin This</div></div>`)
                    .promise()
                    .done(function () {
                        $("#pin_Utility").on("click", function () {
                            var animeName = $(titleDiv).text() || "";
                            // var animeUrl = document.location.href || "";

                            // Why do this and not just take the document.location.href?
                            // Well take the location, then that will also contain the parts
                            // added to the main url to specify episode number (which we are
                            // not interested in)
                            var animeUrl = $("meta[property='og:url']").attr("content");
                            console.log(animeUrl);

                            var requestObj = {
                                intent: "addPinnedAnime",
                                animeName: animeName,
                                animeUrl: animeUrl
                            };

                            chrome.runtime.sendMessage(requestObj, function (response) {
                                console.log(response.result);
                            });

                        });
                    });
            }

        }
    });
    // Test interaction between content script and background page
    // chrome.runtime.sendMessage({intent: "hello"}, function (response) {
    //     console.log(response.result);
    // });

})(jQuery);