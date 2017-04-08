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
        titleDiv = $("h1.title"),
        suggestedDiv =
            $(movieDiv)
                .find("div.widget-title")
                .filter(function () {
                    if ($(this).text() === "You might also like") {
                        return this;
                    }
                })
                .parent();

    // Extract all the information about the current
    // anime. This is extracted from the definition
    // lists found in #info
    var animeInfo = {};
    $(infoDiv).find("dl dt").each(function () {
        var key = $(this).text();
        var value = [];
        $(this).nextUntil("dt").each(function () {
            value.push($(this).text());
        });
        animeInfo[key] = value;
    });
    // console.log(animeInfo);

    // Web Accessible Resource URL's
    var pinImage = chrome.extension.getURL("assets/images/pin.png"),
        redditLogo = chrome.extension.getURL("assets/images/reddit-icon.png"),
        malLogo = chrome.extension.getURL("assets/images/mal-icon.png"),
        loader = chrome.extension.getURL("assets/images/loader.svg"),
        plusIcon = chrome.extension.getURL("assets/images/plus.png"),
        mal_status_wait = chrome.extension.getURL("assets/images/balls.svg"),
        downloadIcon = chrome.extension.getURL("assets/images/download.png");


    // TODO: Iframe remover
    // TODO: Script remover
    function adsRemover() {
        for (var i = 0; i < adsLocationFilter.length; i++) {
            $(adsLocationFilter[i]).remove();
        }
    }

    function playerResizer() {
        $(player).parent().css({width: "100%"});
    }

    /******************************************************************************************************************/
    // Event Listeners
    // ---------------
    // A few components in 9anime Companion emits customs events.
    // We listen to all those events here and act accordingly.

    $(document).on("updateMal", function (event) {
        // Start the status wait animation
        $("#_mal_ops_status_").empty().append(`<img src="${mal_status_wait}">`);

        try {
            var details = JSON.parse(event.detail);
            // console.log(details);
        } catch (e) {
            console.debug(e);
        }

        var requestObj = {
            intent: "updateMal",
            animeId: details.id,
            episode: details.episode
            // image: details.image
        };
        chrome.runtime.sendMessage(requestObj, function (response) {
            // console.log(response);
            $("#_mal_ops_status_").empty();
        });
    });

    // This variable keeps track of all the anime which are added
    // to MAL after the widget has been initially attached.
    var mal_added_this_session = [];

    $(document).on("addMal", function (event) {
        // Start the status wait animation
        $("#_mal_ops_status_").empty().append(`<img src="${mal_status_wait}">`);

        try {
            var details = JSON.parse(event.detail);
            // console.log(details);
        } catch (e) {
            console.debug(e);
        }

        var requestObj = {
            intent: "addMal",
            animeId: details.id
            // image: details.image
        };
        chrome.runtime.sendMessage(requestObj, function (response) {
            if (response.result === "success") {
                mal_added_this_session.push(details.id);
                $("#recommended").trigger("change");
            } else {
                console.log(response);
            }

            $("#_mal_ops_status_").empty();
        });
    });

    /******************************************************************************************************************/
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
            $(servers).parent().css({width: "100%"});

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

        /**************************************************************************************************************/
        // UTILITY BAR
        // -----------
        // This portion deals with attaching the utility bar
        // at the bottom of the player. This bar provide quite
        // a few functionality like pin etc.
        if (settings["utilityBarToggle"]) {
            if ($(player).length > 0) {
                $(player)
                    .parent()
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
                            <div id="download_all_utility" class="utility_item">
                                <img src='${downloadIcon}'>
                                Download All
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

                            if (animeInfo["Other names:"] && animeInfo["Other names:"].length > 0) {

                                // Why the 0th Index? Because all the values are stored
                                // as arrays.
                                animeInfo["Other names:"][0].split(";").forEach(function (name) {

                                    // We don't want the leading and trailing spaces.
                                    // So we trim it.
                                    var trimmedName = name.trim();

                                    // We need this check because we don't want to add
                                    // blank strings to the alternate names.
                                    if (trimmedName) {
                                        alternateNames.push(trimmedName);
                                    }
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

                        // Click listener for download all utility
                        $("#download_all_utility").on("click", function () {
                            var episodes = [];
                            $(servers)
                                // We are only interested in the direct
                                // file server downloads. And not the iframe ones
                                // like openload etc.
                                .find(".server.row[data-type='direct']")
                                // There are usually 2 direct servers, f1 and f2
                                // we select the first one for now
                                .first()
                                .find(".episodes.range li > a")
                                .each(function () {
                                    episodes.push({
                                        id: $(this).data("id"),
                                        number: $(this).data("base")
                                    });
                                });
                            
                            console.log(episodes);
                            chrome.runtime.sendMessage({
                                intent: "downloadFiles",
                                episodes: episodes,
                                animeName: animeName
                            });
                        })
                    });
            }

        }

        /**************************************************************************************************************/
        // MAL INTEGRATION
        // ---------------
        // This portion is responsible for the MyAnimeList integration
        // which adds features such as updating and adding anime to
        // user's MAL.

        /**
         * Generates the div responsible for showing the status icons.
         *
         * @returns {Element}
         */
        function generateOpsStatusTemplate() {
            var opsDiv = document.createElement("div");
            opsDiv.id = "_mal_ops_status_";
            return opsDiv;
        }

        /**
         * Generate the select box with the list of given anime.
         *
         * @param animeList
         * @returns {Element}
         */
        function generateSelectTemplate(animeList) {
            // ---- Select anime ----
            var selectAnime = document.createElement("select");
            selectAnime.id = "recommended";

            var defaultOption = document.createElement("option");
            defaultOption.appendChild(document.createTextNode("..."));
            defaultOption.dataset.id = "_mal_default_";
            selectAnime.append(defaultOption);

            for (var i = 0; i < animeList.length; i++) {
                // If it has no episodes then we dont care about it
                if (animeList[i].episodes > 0) {
                    // console.log(animeList[i]);

                    // --- Create and append the options to select ---
                    var option = document.createElement("option");
                    option.value = animeList[i].id;
                    option.dataset.episodes = animeList[i].episodes;
                    option.dataset.id = animeList[i].id;
                    option.dataset.image = animeList[i].image;

                    option.appendChild(document.createTextNode(animeList[i].title));
                    selectAnime.appendChild(option);
                }
            }
            return selectAnime;
        }

        /**
         * Generate the update anime shell, whose structure is:
         *  ---
         *  <div class="mal_update_shell">
         *      <div class="mal_episodes">
         *          <span class="episode_header">Episodes</span>
         *          <div class="episode_select">
         *              <span>+</span>
         *              <select></select>
         *              <span>Total Episodes</span>
         *          </div>
         *      </div>
         *      <button>Update MAL</button>
         *  </div>
         *  ---
         *
         * @param episodes
         * @param id
         * @param image
         * @param lastWatched
         * @returns {Element}
         */
        function generateMalUpdateShell(episodes, id, image, lastWatched) {
            var malUpdateShell = document.createElement("div");
            malUpdateShell.classList.add("mal_update_shell");

            var div = document.createElement("div");
            div.classList.add("mal_episodes");

            var spanHeader = document.createElement("span");
            spanHeader.append(document.createTextNode("Episode"));
            spanHeader.classList.add("episode_header");
            div.append(spanHeader);

            var div2 = document.createElement("div");
            div2.classList.add("episode_select");

            var incImg = document.createElement("img");
            incImg.classList.add("qol_mal_episode_increment");
            incImg.src = plusIcon;
            incImg.addEventListener("click", function () {
                var ep = document.getElementById("mal_selected_episode");
                ep.value = String(Number(ep.value) + 1);
            });
            div2.append(incImg);

            // For loop starts at 1 Coz' episodes start from 1 :-)
            var select = document.createElement("select");
            select.id = "mal_selected_episode";
            for (var i = 1; i <= episodes; i++) {
                var option = document.createElement("option");
                option.value = i;
                option.append(document.createTextNode(String(i)));
                select.append(option);
            }

            // Set the default value for episode select
            select.value = lastWatched;

            var span = document.createElement("span");
            span.append(document.createTextNode(" / " + episodes));

            div2.append(select);
            div2.append(span);
            div.append(div2);

            // This buttons dispatches a custom event when clicked
            // this custom event contains the data needed to update
            // the user's MAL.
            var btnU = document.createElement("button");
            btnU.id = "_update_mal_";
            btnU.classList.add("mal_shell_btn");
            btnU.append(document.createTextNode("Update MAL"));
            btnU.addEventListener("click", function () {
                // console.log("Event: ", this);
                var event = new CustomEvent("updateMal", {
                    detail: JSON.stringify({
                        id: id,
                        episode: $("#mal_selected_episode").val(),
                        image: image
                    })
                });
                document.dispatchEvent(event);
            });


            malUpdateShell.append(div);
            malUpdateShell.append(btnU);

            return malUpdateShell;
        }

        /**
         * Generate the update anime template, whose structure is:
         *  ---
         *  <div class="mal_add_shell">
         *      <div class="mal_add_anime">
         *          <span class="mal_add_anime_header">This anime in not in your MAL.</span>
         *      </div>
         *      <button>Add to MAL</button>
         *  </div>
         *  ---
         *
         * @returns {Element}
         */
        function generateMalAddShell(id, image) {
            var malAddShell = document.createElement("div");
            malAddShell.classList.add("mal_add_shell");

            var div = document.createElement("div");
            div.classList.add("mal_add_anime");

            var spanHeader = document.createElement("span");
            spanHeader.append(document.createTextNode("This anime in not in your MAL."));
            spanHeader.classList.add("mal_add_anime_header");

            div.append(spanHeader);

            // This buttons dispatches a custom event when clicked
            // this custom event contains the data needed to update
            // the user's MAL.
            var btnA = document.createElement("button");
            btnA.id = "_add_mal_";
            btnA.classList.add("mal_shell_btn");
            btnA.append(document.createTextNode("Add to MAL"));
            btnA.addEventListener("click", function () {
                // console.log("Event: ", this);
                var event = new CustomEvent("addMal", {
                    detail: JSON.stringify({
                        id: id,
                        image: image
                    })
                });
                document.dispatchEvent(event);
            });

            malAddShell.append(div);
            malAddShell.append(btnA);

            return malAddShell;
        }

        if (settings["malIntegrationToggle"]) {
            if ($(player).length > 0) {
                $(player)
                    .parent()
                    .append(
                        `<div class="mal_integration" id="mal_widget">
                        <!-- WARNING: don't manually edit any tags here. 9anime Companion makes use of
                        of these tags to add/update items on your MAL. If you manually change any value,
                        it might cause wrong items to be added. -->
                        <div id="rec_wrapper">
                            <img src="${loader}" height="30px" width="30px" id="mal_loading_image">
                            <!-- select will be added via js -->
                        </div>
                        <div id="rec_list">
                            <!-- The anime add/update panels will be attached here -->
                        </div>
                        </div>`
                    );

                var userMal = null;
                chrome.runtime.sendMessage({
                    intent: "getUserList"
                }, function (response) {
                    try {
                        userMal = response["data"]["myanimelist"]["anime"];
                        // console.log(userMal);
                    } catch (e) {
                        //
                    }

                    // Once we get the userList, we search
                    // for the current anime
                    chrome.runtime.sendMessage({
                        intent: "searchMal",
                        animeName: $(titleDiv).text() || null

                    }, function (response) {
                        // The part below might like daunting at first,
                        // but I have added enough comments for you to
                        // follow. Future me will be proud! ^-^
                        if (response.result === "success") {
                            var animeList = response.data;
                            // console.log(animeList);

                            // --- Attach the select anime ---
                            $("#mal_loading_image").remove();
                            $("#rec_wrapper")
                                .append(generateSelectTemplate(animeList))
                                .append(generateOpsStatusTemplate());

                            // --- Add the change event listener on select ---
                            $("#recommended").on("change", function () {

                                /**************************************************************************************/
                                try {
                                    var selected = $(this).find("option:selected");
                                    var episodes = Number(selected.data("episodes"));
                                    var id = Number(selected.data("id"));
                                    var image = selected.data("image");

                                } catch (e) {
                                    console.debug(e);
                                }

                                /**************************************************************************************/
                                // Just a tiny helper function to check if
                                // an anime exists in users MAL.
                                function checkIfExists() {
                                    for (var i = 0; i < userMal.length; i++) {
                                        if (Number(userMal[i]["series_animedb_id"]) === id) {
                                            return {
                                                status: "exists",
                                                lastWatched: userMal[i]["my_watched_episodes"] || 0
                                            };
                                        }
                                    }

                                    // This part runs a check against any anime that are
                                    // added to MAL after this MAL widget was attached.
                                    for (var j = 0; j < mal_added_this_session.length; j++) {
                                        if (mal_added_this_session[j] === id) {
                                            return {
                                                status: "exists",
                                                lastWatched: 0
                                            };
                                        }
                                    }

                                    // This is the case when the user selects the default
                                    // first option (...)
                                    if (isNaN(id)) return {status: "_mal_default_"};

                                    return false;
                                }

                                /**************************************************************************************/
                                var checkStatus = checkIfExists();
                                // console.log(checkStatus);

                                // If this anime exists in users mal we show
                                // update panel. Else we show add panel
                                if (checkStatus.status === "exists") {
                                    // Remove the previous episode select using
                                    // jQuery's empty method and then append the
                                    // current episode select.
                                    $("#rec_list").empty().append(generateMalUpdateShell(episodes, id, image,
                                        checkStatus.lastWatched));

                                } else if (checkStatus.status === "_mal_default_") {
                                    // --- Default Option ---
                                    // so we basically just empty the div and do
                                    // nothing else.
                                    $("#rec_list").empty()
                                } else {
                                    // --- Add aime to MAL ---
                                    $("#rec_list").empty().append(generateMalAddShell(id, image));
                                }

                            });

                        } else {
                            // console.debug(response.reason);
                            if (response.reason.status === 401) {
                                $("#mal_widget").empty().text("Verification of your MAL Credentials failed. " +
                                    "Please re-verify by going to settings.");
                            } else {
                                $("#mal_widget").empty().text("Oops! Something went wrong.");
                            }
                        }
                    });

                });

            }
        }
    });
})(jQuery);