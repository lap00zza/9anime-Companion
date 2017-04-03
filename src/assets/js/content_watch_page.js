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
    var animeUtils = window.animeUtils;

    // Ads Locations
    // TODO: add a way to update the ads locations remotely via updates
    var adsLocationFilter = [
        ".a_d"
    ];

    // Other important locations
    // All the selectors are placed together so that if in case 9anime
    // changes anything in the future we can easily update it.
    var player = $("#player"),
        infoDiv = $("#info"),
        movieDiv = $("#movie"),
        commentDiv = $("#comment"),
        servers = $("#servers"),
        shareBar = $(".addthis_native_toolbox"), // this is the social network share bar
        playerDiv = $(movieDiv).find("div.container.player-wrapper > div > div.col-lg-17.col-sm-24"),
        topNotificationBar = $(movieDiv).find("div.container.player-wrapper > div > div.col-xs-24"),
        titleDiv = $("h1.title"),
        alternateNamesLoc = $(infoDiv).find("div.row > div.info.col-md-20 > div.row > dl:nth-child(1) > dd:nth-child(2)"),
        suggestedDiv = $(movieDiv).find("div.widget.info > div.widget.container"),
        episodeListDiv = $(movieDiv).find("div.widget.info > div > div > div"),
        playerParent = $(movieDiv).find("div.container.player-wrapper > div > div.col-lg-17.col-sm-24");

    // Web Accessible Resource URL's
    var pinImage = chrome.extension.getURL("assets/images/pin.png"),
        redditLogo = chrome.extension.getURL("assets/images/reddit-icon.png"),
        malLogo = chrome.extension.getURL("assets/images/mal-icon.png");

    
    // TODO: Iframe remover
    // TODO: Script remover
    function adsRemover() {

        for (var i = 0; i < adsLocationFilter.length; i++) {
            $(adsLocationFilter[i]).remove();
        }
    }

    function playerResizer() {
        $(playerDiv).css({width: "100%"});
        $(topNotificationBar).css({width: "100%"});
    }

    // Load Settings.
    animeUtils.loadSettings().then(function (settings) {
        // Minimal Mode
        // This mode will also remove ads and resize/center player,
        // regardless of whether this option is chosen or not.
        if (settings["minimalModeToggle"]) {
            $(suggestedDiv).remove();
            $(commentDiv).remove();
            $(infoDiv).remove();
            $(titleDiv).remove();
            $(episodeListDiv).css({width: "100%"});

            adsRemover();
            playerResizer();
        }

        // If Minimal Mode is disabled, then run these as per user
        // customization.
        if (!settings["minimalModeToggle"]) {
            // Ads Removal
            if (settings["adsToggle"]) {
                // console.log("Oui Ads");
                adsRemover();
            }

            // Player Resizer
            if (settings["playerSizeToggle"]) {
                // console.log("Oui Resize");
                playerResizer();
            }

            // Removes the social network share bar
            if (settings["shareBarToggle"]) {
                $(shareBar).remove();
            }

            // Remove comments
            if (settings["commentsToggle"]) {
                $(commentDiv).remove();
            }

            // Remove You Might Also Like
            if (settings["youMightAlsoLikeToggle"]) {
                $(suggestedDiv).remove();
            }
        }
        
        // This portion deals with attaching the utility bar
        // at the bottom of the player. This bar provide quite
        // a few functionality like pin etc.
        if (settings["utilityBarToggle"]) {
            // console.log("Oui PinIcon");

            if ($(player).length > 0) {
                $(playerParent)
                    .append(
                        `<div class="player_utilities">
                            <!--<div class="utility_header">Utility Bar:</div>-->
                            <div id="pin_utility" class="utility_item">
                                <img src='${pinImage}'>
                                Pin This
                            </div>
                            <div id="reddit_disc_utility" class="utility_item">
                                <img src='${redditLogo}'>
                                Reddit Discussion
                            </div>
                            <div id="mal_search_utility" class="utility_item">
                                <img src='${malLogo}'>
                                Find in MAL
                            </div>
                        </div>`
                    )
                    .promise()
                    .done(function () {
                        var animeName = $(titleDiv).text() || null;
                        
                        $("#pin_utility").on("click", function () {
                            // var animeUrl = document.location.href || "";

                            // Why do this and not just take the document.location.href?
                            // Well if we take that, then it will also contain the parts
                            // added to the main url to specify episode number (which we are
                            // not interested in)
                            var animeUrl = $("meta[property='og:url']").attr("content");
                            console.log(animeUrl);

                            animeUtils
                                .addToPinnedList(animeName, animeUrl)
                                .then(function (response) {
                                    console.log(response);
                                })
                                .catch(function (response) {
                                   console.log(response);
                                });
                        });

                        // The current behaviour is as follows:
                        // If the url contains episodeId portion, for example: /watch/gintama.5kq/llrp3n
                        // then it will open episode discussion. Else it will open general discussion.
                        // TODO: maybe use simple <a href> instead of using chrome.tabs?
                        $("#reddit_disc_utility").on("click", function () {
                            var alternateNames = [];
                            var urlDetails = animeUtils.extractIdFromUrl(document.location.href);
                            var currentlyWatching = $(servers).find(`[data-id='${urlDetails.episodeId}']`).data("base");

                            if ($(alternateNamesLoc).text()) {
                                $(alternateNamesLoc).text().split(";").forEach(function (name) {

                                    // We don't want the leading and trailing spaces.
                                    // So we trim it.
                                    alternateNames.push(name.trim());
                                })
                            }
                            var requestObj = {
                                intent: "openRedditDiscussion",
                                animeName: animeName,
                                alternateNames: alternateNames,
                                episode: currentlyWatching
                            };

                            chrome.runtime.sendMessage(requestObj, function (response) {
                                console.log(response.result);
                            });
                        });
                        
                        $("#mal_search_utility").on("click", function () {
                            var requestObj = {
                                intent: "findInMal",
                                animeName: animeName
                            };

                            chrome.runtime.sendMessage(requestObj, function (response) {
                                console.log(response.result);
                            });
                        });
                    });
            }

        }
    });
})(jQuery);