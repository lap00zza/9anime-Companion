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
/*global chrome*/
import $ from "../lib/jquery-3.2.0.min";

// This variable is used to resolve ID's in case more than
// one MAL Widget is used on a page.
var widgetCount = 0;

// This variable keeps track of all the anime which are added
// to MAL after the widget has been initially attached.
var mal_added_this_session = [];

// Loader Image
var mal_status_wait = chrome.extension.getURL("assets/images/balls.svg");

$(document).on("updateMal", function (event) {

    try {
        var details = JSON.parse(event.detail);
        var refWidget = $(`#${details.referringWidgetId}`);

        $(refWidget)
            .find("._mal_ops_status_")
            .empty()
            .append(`<img src="${mal_status_wait}">`);

        var requestObj = {
            intent: "updateMal",
            animeId: details.id,
            episode: details.episode
        };

        chrome.runtime.sendMessage(requestObj, function () {
            $(refWidget).find("._mal_ops_status_").empty();
        });

    } catch (e) {
        console.error(e);
    }

});

$(document).on("addMal", function (event) {

    try {
        var details = JSON.parse(event.detail);
        var refWidget = $(`#${details.referringWidgetId}`);

        $(refWidget)
            .find("._mal_ops_status_")
            .empty()
            .append(`<img src="${mal_status_wait}">`);

        var requestObj = {
            intent: "addMal",
            animeId: details.id
        };


        chrome.runtime.sendMessage(requestObj, function (response) {
            if (response.result === "success") {
                mal_added_this_session.push(details.id);
                $(refWidget).find(".recommended").trigger("change");
            }

            $(refWidget).find("._mal_ops_status_").empty();
        });

    } catch (e) {
        console.error(e);
    }

});

function MyAnimeListWidget(animeName) {

    // Every time this widget is generated, we increment by 1
    widgetCount += 1;

    var malWidgetId = `9ac-mal_Integration-widget_${widgetCount}`;
    var plusIcon = chrome.extension.getURL("assets/images/plus.png");
    var loader = chrome.extension.getURL("assets/images/loader.svg");
    var malTemplate = $(
        `<div class="mal_integration" id="${malWidgetId}">
            <!-- WARNING: don't manually edit any tags here. 9anime Companion makes use of
            of these tags to add/update items on your MAL. If you manually change any value,
            it might cause wrong items to be added. -->
            <div class="rec_wrapper">
                <img src="${loader}" height="30px" width="30px" class="mal_loading_image">
                <!-- select will be added via js -->
            </div>
            <div class="rec_list">
                <!-- The anime add/update panels will be attached here -->
            </div>
            <div class="_mal_ops_status_"></div>
        </div>`);

    /**
     * A simple helper function to remove the leading and trailing
     * whitespace in each lines of template literals and package
     * output a single string.
     *
     * @param inStr
     * @returns {string}
     */
    function deDent(inStr) {
        return inStr
            .split("\n")
            .map(function (item) {
                return item.trim();
            })
            .join("");
    }

    /**
     * Generate the select box with the list of given anime.
     *
     * @param animeList
     * @returns {Element}
     */
    function generateSelectTemplate(animeList) {
        var selectAnime = document.createElement("select");
        selectAnime.classList.add("recommended");

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
     * Generates the update anime shell.
     *
     * @param episodes
     * @param id
     * @param image
     * @param lastWatched
     * @returns {Element}
     */
    function generateMalUpdateShell(episodes, id, image, lastWatched) {
        var malUpdateShell = $(deDent(
            `<div class="mal_update_shell">
                <div class="mal_episodes">
                    <span class="episode_header">Episode</span>
                    <div class="episode_select">
                        <img src="${plusIcon}" class="qol_mal_episode_increment">
                        <select class='mal_selected_episode'></select>
                        <span> / ${episodes}</span>
                    </div>
                </div>
                <button type="button" class="_update_mal_">Update MAL</button>
            </div>`
        ));

        $(malUpdateShell).find(".qol_mal_episode_increment").on("click", function () {
            var ep = $(malUpdateShell).find(".mal_selected_episode");
            ep.val(String(Number(ep.val()) + 1));
        });

        // For loop starts at 1 Coz' episodes start from 1 :-)
        var select = $(malUpdateShell).find(".mal_selected_episode");
        for (var i = 1; i <= episodes; i++) {
            // For the value that we get from outside, we use textNode
            var option = document.createElement("option");
            option.value = i;
            option.append(document.createTextNode(String(i)));

            // Bind
            $(select).append(option);
        }

        // Set the default value for episode select
        $(select).val(lastWatched);

        $(malUpdateShell).find("._update_mal_").on("click", function () {
            var event = new CustomEvent("updateMal", {
                detail: JSON.stringify({
                    id: id,
                    episode: $(malUpdateShell).find(".mal_selected_episode").val(),
                    image: image,
                    referringWidgetId: malWidgetId
                })
            });
            document.dispatchEvent(event);
        });

        return malUpdateShell;
    }

    /**
     * Generates the update anime template.
     *
     * @returns {Element}
     */
    function generateMalAddShell(id, image) {
        var malAddShell = $(deDent(
            `<div class="mal_add_shell">
                <div class="mal_add_anime">
                    <span class="mal_add_anime_header">This anime in not in your MAL.</span>
                </div>
                <button type="button" class="_add_mal_">Add to MAL</button>
            </div>`
        ));

        $(malAddShell).find("._add_mal_").on("click", function () {
            var event = new CustomEvent("addMal", {
                detail: JSON.stringify({
                    id: id,
                    image: image,
                    referringWidgetId: malWidgetId
                })
            });
            document.dispatchEvent(event);
        });

        return malAddShell;
    }

    /**
     * Just a tiny helper function to check if
     * an anime exists in users MAL.
     *
     * @param userMal
     * @param id
     * @returns {*}
     */
    function checkIfExists(userMal, id) {
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

    /******************************************************************************************************************/
    // Add Behaviour to the Template
    // -----------------------------
    var userMal = null;
    chrome.runtime.sendMessage({
        intent: "getUserList"
    }, function (response) {
        if (response.result === "success") {
            try {
                userMal = response["data"]["myanimelist"]["anime"];

                // Once we get the userList, we search for the current anime
                chrome.runtime.sendMessage({
                    intent: "searchMal",
                    animeName: animeName || ""

                }, function (response) {
                    // The part below might like daunting at first,
                    // but I have added enough comments for you to
                    // follow. Future me will be proud! ^-^
                    if (response.result === "success") {
                        var animeList = response.data;

                        // --- Attach the select anime ---
                        $(malTemplate).find(".mal_loading_image").remove();
                        $(malTemplate).find(".rec_wrapper").append(generateSelectTemplate(animeList));

                        // --- Add the event listeners on select ---
                        $(malTemplate)
                            .find(".recommended")
                            .on("change", function () {

                                try {
                                    var selected = $(this).find("option:selected");
                                    var episodes = Number(selected.data("episodes"));
                                    var id = Number(selected.data("id"));
                                    var image = selected.data("image");
                                    var checkStatus = checkIfExists(userMal, id);

                                    // If this anime exists in users mal we show
                                    // update panel. Else we show add panel
                                    if (checkStatus.status === "exists") {
                                        // Remove the previous episode select using
                                        // jQuery's empty method and then append the
                                        // current episode select.
                                        $(malTemplate)
                                            .find(".rec_list").empty()
                                            .append(generateMalUpdateShell(episodes, id, image, checkStatus.lastWatched));

                                    } else if (checkStatus.status === "_mal_default_") {
                                        // We basically just empty the div and do
                                        // nothing else.
                                        $(malTemplate).find(".rec_list").empty();

                                    } else {
                                        // Add aime to MAL
                                        $(malTemplate).find(".rec_list").empty().append(generateMalAddShell(id, image));
                                    }

                                } catch (e) {
                                    console.error(e);
                                }
                            });

                    } else {
                        if (response.reason.status === 401) {
                            $(malTemplate).empty().text("Verification of your MAL Credentials failed.");
                        } else {
                            $(malTemplate).empty().text("Oops! Something went wrong. Maybe you revoked " +
                                "the additional permissions?");
                        }
                    }
                });

            } catch (e) {
                //
            }
        } else {
            if (response.reason === "Not Verified") {
                $(malTemplate).empty().text("Verification of your MAL Credentials failed.");
            } else {
                $(malTemplate).empty().text("Oops! Something went wrong. Maybe you revoked " +
                    "the additional permissions?");
            }
        }
    });

    return malTemplate;
}

export {
    MyAnimeListWidget
};
